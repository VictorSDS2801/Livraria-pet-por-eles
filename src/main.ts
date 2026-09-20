import * as dotenv from 'dotenv';
dotenv.config({
  path: ['.env.production', '.env', '.env.local', '.env.test'],
  quiet: true, // silencia os "tips" promocionais que o dotenv (v17+) imprime no console
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { GlobalExceptionFilter } from './shared/exceptions/global-exception.filter';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

async function bootstrap() {
  // bufferLogs: true faz o Nest esperar o Pino carregar antes de logar
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // 1. Configura o Pino como Logger oficial
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // 2. Filtro Global de Erros
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 3. Validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 4. Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Livraria API')
    .setDescription('CRUD de livros, registro de vendas e relatório de lucro (DDD + Pino Logs)')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  if (!fs.existsSync('./docs')) {
    fs.mkdirSync('./docs');
  }
  fs.writeFileSync('./docs/openapi.yaml', yaml.stringify(document));

  // CORS: libera o frontend publicado (lista separada por vírgulas em CORS_ORIGINS)
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  // 5. Iniciar Servidor
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Aplicação rodando na porta: ${port}`);
  console.log(`📄 Documentação em: http://localhost:${port}/api/docs`);
}
bootstrap();
