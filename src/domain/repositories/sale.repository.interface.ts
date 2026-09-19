import { Sale } from '../entities/sale';
import { ISaleFilters, IProfitSummary } from '../interfaces/sale.interfaces';
import { IPaginatedResult } from './book.repository.interface';

export const I_SALE_REPOSITORY = Symbol('ISaleRepository');

export interface ISaleRepository {
  saveSale(sale: Sale): Promise<Sale>;
  findAllSales(filters: ISaleFilters): Promise<IPaginatedResult<Sale>>;
  getProfitSummary(filters: Pick<ISaleFilters, 'startDate' | 'endDate'>): Promise<IProfitSummary>;
}
