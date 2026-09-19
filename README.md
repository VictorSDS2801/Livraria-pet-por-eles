# MS-Livraria

Microserviço de gestão de uma livraria: CRUD de livros com busca, registro de vendas com baixa
automática de estoque, e relatório de lucro. Baseado na arquitetura do boilerplate `MS-Appointment`
(DDD + NestJS + Pino + filtro global de exceções), adaptado para este domínio — **sem fila (BullMQ)**,
**sem notificações**, **sem OpenTelemetry** e **sem suíte de testes**, conforme solicitado.

## Stack

- NestJS + TypeScript
- MongoDB Atlas (via Mongoose)
- nestjs-pino (logs estruturados) + correlation id por requisição
- class-validator / class-transformer
- Swagger (`/api/docs`, e um `docs/openapi.yaml` gerado a cada boot)

## Arquitetura

```
src/
├── app.module.ts
├── main.ts
├── application/
│   ├── controllers/        → BookController, SaleController, ReportController
│   └── dtos/                → validação de entrada (class-validator)
├── domain/
│   ├── entities/             → Book, Sale (regras de negócio vivem aqui)
│   ├── exceptions/           → DomainException (mapeada para HTTP 422 no filtro global)
│   ├── interfaces/           → contratos de dados do domínio (IBook, ISale, ...)
│   ├── repositories/         → interfaces de repositório (tokens via Symbol)
│   └── services/             → BookService, SaleService, ReportService (orquestram o domínio)
├── infrastructure/
│   └── database/
│       ├── database.module.ts
│       ├── schemas/          → schemas Mongoose
│       ├── mappers/          → documento Mongoose ⇄ entidade de domínio
│       └── repositories/     → implementação concreta das interfaces do domínio
└── shared/
    ├── exceptions/           → GlobalExceptionFilter
    ├── observability/        → correlation-id (gera/propaga x-correlation-id)
    └── pipes/                → ParseMongoIdPipe
```

**Regras de negócio no domínio:**
- `Book.decreaseStock()` nunca deixa o estoque negativo — lança `DomainException` (`INSUFFICIENT_STOCK`) se não houver unidades suficientes.
- `Sale` guarda uma "fotografia" do preço de custo/venda no momento da compra — editar o preço de um livro depois não altera vendas já registradas.
- Excluir um livro é soft delete (`Book.deactivate()`) — o histórico de vendas permanece íntegro.

Assim como no boilerplate original, os *services* de domínio dependem apenas das **interfaces**
de repositório (tokens `I_BOOK_REPOSITORY` / `I_SALE_REPOSITORY`, via `Symbol`), nunca do Mongoose
diretamente. O `DatabaseModule` é quem faz esse binding.

## Como rodar

```bash
npm install
cp .env.example .env
```

Edite `.env` e cole sua connection string do **MongoDB Atlas** em `MONGO_URI`. Se a variável
estiver ausente, a aplicação falha ao subir com uma mensagem de erro clara.

```bash
npm run start:dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

## Endpoints

| Método | Rota                        | Descrição                                            |
|--------|-----------------------------|-------------------------------------------------------|
| POST   | `/books`                    | Cria um livro                                          |
| GET    | `/books`                    | Busca livros ativos (título, autor, categoria) + paginação |
| GET    | `/books/:id`                 | Busca um livro pelo id                                 |
| PATCH  | `/books/:id`                 | Atualiza um livro                                       |
| DELETE | `/books/:id`                 | Remove um livro (soft delete)                           |
| POST   | `/sales`                     | Registra uma venda (valida/debita estoque, calcula lucro) |
| GET    | `/sales`                     | Lista vendas, com filtro opcional por período           |
| GET    | `/reports/profit-summary`    | Receita, custo e lucro totais num período               |

## Categorias de livro disponíveis

`FICTION`, `NON_FICTION`, `TECHNICAL`, `CHILDREN`, `ACADEMIC`, `BIOGRAPHY`, `OTHER`
(edite a lista em `domain/entities/book.ts`, `domain/interfaces/book.interfaces.ts` e
`infrastructure/database/schemas/book.schema.ts` para adicionar mais).

## O que foi removido do boilerplate original

- **BullMQ / Redis** (fila de jobs) — não há necessidade de jobs assíncronos aqui.
- **Notificações** (port/adapter) — não fazem parte do escopo da livraria.
- **OpenTelemetry** — tracing removido; `correlation-id.ts` foi simplificado para gerar/propagar
  o id via header (`x-correlation-id`) sem depender do SDK de tracing.
- **Testes (Jest, mongodb-memory-server, etc.)** — removidos a pedido; a estrutura de camadas
  (domínio isolado de infraestrutura) continua pronta para receber testes unitários no futuro,
  se necessário.
- **docker-compose.yml** — não é mais necessário localmente, já que o banco é o MongoDB Atlas.
