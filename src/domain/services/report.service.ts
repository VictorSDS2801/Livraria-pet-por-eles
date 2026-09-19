import { Injectable, Inject } from '@nestjs/common';
import { I_SALE_REPOSITORY, ISaleRepository } from '../repositories/sale.repository.interface';
import { IProfitSummary } from '../interfaces/sale.interfaces';

@Injectable()
export class ReportService {
  constructor(
    @Inject(I_SALE_REPOSITORY)
    private readonly saleRepository: ISaleRepository,
  ) {}

  async getProfitSummary(filters: { startDate?: Date; endDate?: Date }): Promise<IProfitSummary> {
    return this.saleRepository.getProfitSummary(filters);
  }
}
