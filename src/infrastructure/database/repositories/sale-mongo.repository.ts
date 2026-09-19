import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale } from '../../../domain/entities/sale';
import { ISaleRepository } from '../../../domain/repositories/sale.repository.interface';
import { IPaginatedResult } from '../../../domain/repositories/book.repository.interface';
import { SaleModel, SaleDocument } from '../schemas/sale.schema';
import { SaleMapper } from '../mappers/sale.mapper';
import { ISaleFilters, IProfitSummary } from '../../../domain/interfaces/sale.interfaces';

function buildDateRangeQuery(filters: { startDate?: Date; endDate?: Date }): any {
  const query: any = {};
  if (filters.startDate || filters.endDate) {
    query.saleDate = {};
    if (filters.startDate) query.saleDate.$gte = filters.startDate;
    if (filters.endDate) query.saleDate.$lte = filters.endDate;
  }
  return query;
}

@Injectable()
export class SaleMongoRepository implements ISaleRepository {
  constructor(
    @InjectModel(SaleModel.name)
    private readonly saleModel: Model<SaleDocument>,
  ) {}

  async saveSale(sale: Sale): Promise<Sale> {
    const created = await this.saleModel.create(SaleMapper.toPersistence(sale));
    return SaleMapper.toDomain(created);
  }

  async findAllSales(filters: ISaleFilters): Promise<IPaginatedResult<Sale>> {
    const query = buildDateRangeQuery(filters);

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.saleModel.find(query).sort({ saleDate: -1 }).skip(skip).limit(limit).exec(),
      this.saleModel.countDocuments(query).exec(),
    ]);

    return {
      items: docs.map((doc) => SaleMapper.toDomain(doc)),
      total,
    };
  }

  async getProfitSummary(filters: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<IProfitSummary> {
    const query = buildDateRangeQuery(filters);

    const [result] = await this.saleModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          totalCost: { $sum: '$totalCost' },
          totalProfit: { $sum: '$profit' },
          salesCount: { $sum: 1 },
        },
      },
    ]);

    return {
      totalRevenue: result?.totalRevenue ?? 0,
      totalCost: result?.totalCost ?? 0,
      totalProfit: result?.totalProfit ?? 0,
      salesCount: result?.salesCount ?? 0,
    };
  }
}
