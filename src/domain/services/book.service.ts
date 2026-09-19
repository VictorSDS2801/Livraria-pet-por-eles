import { Injectable, Inject } from '@nestjs/common';
import { I_BOOK_REPOSITORY, IBookRepository } from '../repositories/book.repository.interface';
import { Book } from '../entities/book';
import { IBookFilters, IBookParameters, IBookUpdateParameters } from '../interfaces/book.interfaces';
import { DomainException } from '../exceptions/domain.exception';

@Injectable()
export class BookService {
  constructor(
    @Inject(I_BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async createBook(data: IBookParameters): Promise<Book> {
    const book = new Book(data);
    return this.bookRepository.saveBook(book);
  }

  async findBookById(id: string): Promise<Book> {
    const book = await this.bookRepository.findActiveBookById(id);

    if (!book) {
      throw new DomainException(`Livro com id ${id} não encontrado.`, 'BOOK_NOT_FOUND');
    }

    return book;
  }

  async searchBooks(filters: IBookFilters) {
    return this.bookRepository.searchBooks(filters);
  }

  async updateBook(id: string, data: IBookUpdateParameters): Promise<Book> {
    const book = await this.findBookById(id);
    book.updateDetails(data);
    return this.bookRepository.updateBook(book);
  }

  /** Soft delete: mantém o livro no banco (e o histórico de vendas íntegro), só marca como inativo. */
  async deactivateBook(id: string): Promise<void> {
    const book = await this.findBookById(id);
    book.deactivate();
    await this.bookRepository.updateBook(book);
  }
}
