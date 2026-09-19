import { Sale } from '../../../domain/entities/sale';
import { SaleDocument } from '../schemas/sale.schema';
import { Types } from 'mongoose';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export class SaleMapper {
  static toDomain(raw: SaleDocument): Sale {
    return new Sale({
      id: raw._id.toString(),
      bookId: raw.bookId.toString(),
      bookTitleSnapshot: raw.bookTitleSnapshot,
      quantity: raw.quantity,
      unitCostPrice: raw.unitCostPrice,
      unitSalePrice: raw.unitSalePrice,
      totalRevenue: raw.totalRevenue,
      totalCost: raw.totalCost,
      profit: raw.profit,
      saleDate: raw.saleDate,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(entity: Sale): any {
    if (!entity.bookId || !Types.ObjectId.isValid(entity.bookId)) {
      throw new DomainException('bookId inválido', 'INVALID_BOOK_ID');
    }

    return {
      bookId: new Types.ObjectId(entity.bookId),
      bookTitleSnapshot: entity.bookTitleSnapshot,
      quantity: entity.quantity,
      unitCostPrice: entity.unitCostPrice,
      unitSalePrice: entity.unitSalePrice,
      totalRevenue: entity.totalRevenue,
      totalCost: entity.totalCost,
      profit: entity.profit,
      saleDate: entity.saleDate,
    };
  }

  static toResponse(entity: Sale) {
    return {
      id: entity.id,
      bookId: entity.bookId,
      bookTitleSnapshot: entity.bookTitleSnapshot,
      quantity: entity.quantity,
      unitCostPrice: entity.unitCostPrice,
      unitSalePrice: entity.unitSalePrice,
      totalRevenue: entity.totalRevenue,
      totalCost: entity.totalCost,
      profit: entity.profit,
      saleDate: entity.saleDate,
    };
  }
}
