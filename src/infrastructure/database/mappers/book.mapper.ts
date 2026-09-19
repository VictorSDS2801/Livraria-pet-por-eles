import { Book } from '../../../domain/entities/book';
import { BookDocument } from '../schemas/book.schema';
import { Types } from 'mongoose';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export class BookMapper {
  static toDomain(raw: BookDocument): Book {
    return new Book({
      id: raw._id.toString(),
      title: raw.title,
      author: raw.author,
      category: raw.category,
      costPrice: raw.costPrice,
      salePrice: raw.salePrice,
      stock: raw.stock,
      active: raw.active,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: Book): any {
    const data: any = {
      title: entity.title,
      author: entity.author,
      category: entity.category,
      costPrice: entity.costPrice,
      salePrice: entity.salePrice,
      stock: entity.stock,
      active: entity.active,
      updatedAt: entity.updatedAt,
    };

    if (entity.id) {
      if (!Types.ObjectId.isValid(entity.id)) {
        throw new DomainException('id de livro inválido', 'INVALID_BOOK_ID');
      }
      data._id = new Types.ObjectId(entity.id);
    } else {
      data.createdAt = entity.createdAt;
    }

    return data;
  }

  static toResponse(entity: Book) {
    return {
      id: entity.id,
      title: entity.title,
      author: entity.author,
      category: entity.category,
      costPrice: entity.costPrice,
      salePrice: entity.salePrice,
      stock: entity.stock,
      active: entity.active,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
