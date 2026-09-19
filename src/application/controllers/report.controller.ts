import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportService } from '../../domain/services/report.service';
import { ProfitSummaryQueryDTO } from '../dtos/report.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('profit-summary')
  @ApiOperation({ summary: 'retorna receita, custo e lucro totais num período' })
  @ApiResponse({ status: 200, description: 'resumo calculado com sucesso' })
  async getProfitSummary(@Query() query: ProfitSummaryQueryDTO) {
    return this.reportService.getProfitSummary({
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
  }
}
