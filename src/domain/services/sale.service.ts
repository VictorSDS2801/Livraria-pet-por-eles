import { Injectable, Inject } from '@nestjs/common';
import { I_SALE_REPOSITORY, ISaleRepository } from '../repositories/sale.repository.interface';
import { I_BOOK_REPOSITORY, IBookRepository } from '../repositories/book.repository.interface';
import { Sale } from '../entities/sale';
import { ISaleFilters, ISaleParameters } from '../interfaces/sale.interfaces';
import { DomainException } from '../exceptions/domain.exception';

@Injectable()
export class SaleService {
  constructor(
    @Inject(I_SALE_REPOSITORY)
    private readonly saleRepository: ISaleRepository,
    @Inject(I_BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  /**
   * Registra uma venda.
   * Ordem importa: primeiro pedimos à entidade Book para debitar o próprio
   * estoque (o que lança DomainException se não houver estoque suficiente),
   * persistimos esse estoque atualizado, e só então criamos o registro de
   * Sale com a "fotografia" dos preços atuais do livro.
   */
  async registerSale(data: ISaleParameters): Promise<Sale> {
    const book = await this.bookRepository.findActiveBookById(data.bookId);

    if (!book) {
      throw new DomainException(`Livro com id ${data.bookId} não encontrado.`, 'BOOK_NOT_FOUND');
    }

    const unitCostPrice = book.costPrice;
    const unitSalePrice = book.salePrice;

    book.decreaseStock(data.quantity);
    await this.bookRepository.updateBook(book);

    const sale = new Sale({
      bookId: book.id,
      bookTitleSnapshot: book.title,
      quantity: data.quantity,
      unitCostPrice,
      unitSalePrice,
    });

    return this.saleRepository.saveSale(sale);
  }

  async findAllSales(filters: ISaleFilters) {
    return this.saleRepository.findAllSales(filters);
  }
}
