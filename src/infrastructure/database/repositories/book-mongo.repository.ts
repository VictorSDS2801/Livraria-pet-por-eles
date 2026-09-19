import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from '../../../domain/entities/book';
import {
  IBookRepository,
  IPaginatedResult,
} from '../../../domain/repositories/book.repository.interface';
import { BookModel, BookDocument } from '../schemas/book.schema';
import { BookMapper } from '../mappers/book.mapper';
import { IBookFilters } from '../../../domain/interfaces/book.interfaces';

@Injectable()
export class BookMongoRepository implements IBookRepository {
  constructor(
    @InjectModel(BookModel.name)
    private readonly bookModel: Model<BookDocument>,
  ) {}

  async saveBook(book: Book): Promise<Book> {
    const created = await this.bookModel.create(BookMapper.toPersistence(book));
    return BookMapper.toDomain(created);
  }

  async updateBook(book: Book): Promise<Book> {
    const updated = await this.bookModel.findOneAndUpdate(
      { _id: book.id },
      { $set: BookMapper.toPersistence(book) },
      { upsert: false, new: true },
    );

    if (!updated) {
      throw new Error(`Livro com id ${book.id} não encontrado.`);
    }

    return BookMapper.toDomain(updated);
  }

  async findBookById(id: string): Promise<Book | null> {
    const doc = await this.bookModel.findById(id).exec();
    return doc ? BookMapper.toDomain(doc) : null;
  }

  async findActiveBookById(id: string): Promise<Book | null> {
    const doc = await this.bookModel.findOne({ _id: id, active: true }).exec();
    return doc ? BookMapper.toDomain(doc) : null;
  }

  async searchBooks(filters: IBookFilters): Promise<IPaginatedResult<Book>> {
    const query: any = { active: true };

    if (filters.title) query.title = { $regex: filters.title, $options: 'i' };
    if (filters.author) query.author = { $regex: filters.author, $options: 'i' };
    if (filters.category) query.category = filters.category;

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.bookModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.bookModel.countDocuments(query).exec(),
    ]);

    return {
      items: docs.map((doc) => BookMapper.toDomain(doc)),
      total,
    };
  }
}
