import { Book } from '../entities/book';
import { IBookFilters } from '../interfaces/book.interfaces';

export const I_BOOK_REPOSITORY = Symbol('IBookRepository');

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
}

export interface IBookRepository {
  saveBook(book: Book): Promise<Book>;
  updateBook(book: Book): Promise<Book>;
  findBookById(id: string): Promise<Book | null>;
  findActiveBookById(id: string): Promise<Book | null>;
  searchBooks(filters: IBookFilters): Promise<IPaginatedResult<Book>>;
}
