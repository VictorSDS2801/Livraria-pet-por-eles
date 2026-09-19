import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';
import { BookService } from '../../domain/services/book.service';
import { BookMapper } from '../../infrastructure/database/mappers/book.mapper';
import { ParseMongoIdPipe } from '../../shared/pipes/parse-mongo-id.pipe';
import { CreateBookDTO, FindAllBookDTO, UpdateBookDTO } from '../dtos/book.dto';

@ApiTags('books')
@Controller('books')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly logger: PinoLogger,
  ) {}

  @Post()
  @ApiOperation({ summary: 'cadastra um novo livro' })
  @ApiResponse({ status: 201, description: 'livro criado com sucesso' })
  @ApiResponse({ status: 400, description: 'dados inválidos' })
  async create(@Body() body: CreateBookDTO) {
    this.logger.info({ title: body.title, author: body.author }, 'Criando novo livro');
    const book = await this.bookService.createBook(body as any);
    this.logger.info({ id: book.id }, 'Livro criado com sucesso');
    return BookMapper.toResponse(book);
  }

  @Get()
  @ApiOperation({ summary: 'busca livros ativos por título, autor e/ou categoria' })
  @ApiResponse({ status: 200, description: 'busca realizada com sucesso' })
  async findAll(@Query() query: FindAllBookDTO) {
    const { items, total } = await this.bookService.searchBooks(query as any);

    this.logger.info({ filters: query, count: items.length }, 'Busca de livros realizada');

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return {
      data: items.map(BookMapper.toResponse),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'busca um livro pelo id' })
  @ApiResponse({ status: 200, description: 'livro encontrado' })
  @ApiResponse({ status: 422, description: 'livro não encontrado' })
  async findOne(@Param('id', ParseMongoIdPipe) id: string) {
    const book = await this.bookService.findBookById(id);
    return BookMapper.toResponse(book);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'atualiza dados de um livro' })
  @ApiResponse({ status: 200, description: 'livro atualizado com sucesso' })
  @ApiResponse({ status: 422, description: 'livro não encontrado' })
  async update(@Param('id', ParseMongoIdPipe) id: string, @Body() body: UpdateBookDTO) {
    this.logger.info({ id, changes: body }, 'Atualizando livro');
    const book = await this.bookService.updateBook(id, body as any);
    this.logger.info({ id }, 'Livro atualizado com sucesso');
    return BookMapper.toResponse(book);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'remove um livro (soft delete: mantém o histórico de vendas)' })
  @ApiResponse({ status: 204, description: 'livro removido com sucesso' })
  @ApiResponse({ status: 422, description: 'livro não encontrado' })
  async remove(@Param('id', ParseMongoIdPipe) id: string) {
    this.logger.info({ id }, 'Desativando livro');
    await this.bookService.deactivateBook(id);
    this.logger.info({ id }, 'Livro desativado com sucesso');
  }
}
