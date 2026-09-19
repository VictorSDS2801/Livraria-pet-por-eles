import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PinoLogger } from 'nestjs-pino';
import { SaleService } from '../../domain/services/sale.service';
import { SaleMapper } from '../../infrastructure/database/mappers/sale.mapper';
import { CreateSaleDTO, FindAllSaleDTO } from '../dtos/sale.dto';

@ApiTags('sales')
@Controller('sales')
export class SaleController {
  constructor(
    private readonly saleService: SaleService,
    private readonly logger: PinoLogger,
  ) {}

  @Post()
  @ApiOperation({ summary: 'registra uma venda (debita estoque e calcula lucro automaticamente)' })
  @ApiResponse({ status: 201, description: 'venda registrada com sucesso' })
  @ApiResponse({ status: 422, description: 'livro não encontrado ou estoque insuficiente' })
  async create(@Body() body: CreateSaleDTO) {
    this.logger.info({ bookId: body.bookId, quantity: body.quantity }, 'Registrando venda');
    const sale = await this.saleService.registerSale(body);
    this.logger.info({ id: sale.id, profit: sale.profit }, 'Venda registrada com sucesso');
    return SaleMapper.toResponse(sale);
  }

  @Get()
  @ApiOperation({ summary: 'lista vendas, com filtro opcional por período' })
  @ApiResponse({ status: 200, description: 'busca realizada com sucesso' })
  async findAll(@Query() query: FindAllSaleDTO) {
    const { items, total } = await this.saleService.findAllSales({
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      page: query.page,
      limit: query.limit,
    });

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return {
      data: items.map(SaleMapper.toResponse),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }
}
