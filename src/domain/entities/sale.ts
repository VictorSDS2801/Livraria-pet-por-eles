import { DomainException } from '../exceptions/domain.exception';
import { ISale } from '../interfaces/sale.interfaces';

export class Sale {
  private _id: string;
  private _bookId: string;
  private _bookTitleSnapshot: string;
  private _quantity: number;
  private _unitCostPrice: number;
  private _unitSalePrice: number;
  private _totalRevenue: number;
  private _totalCost: number;
  private _profit: number;
  private _saleDate: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  /**
   * Uma venda é um registro histórico: `unitCostPrice`/`unitSalePrice` são
   * uma "fotografia" do livro no momento da venda (por isso são passados
   * explicitamente aqui, e não recalculados a partir do livro depois).
   * Se o preço do livro mudar no futuro, vendas já registradas não mudam.
   */
  constructor(params: ISale) {
    this.validateQuantity(params.quantity);
    this.validateNonNegative(params.unitCostPrice, 'unitCostPrice');
    this.validateNonNegative(params.unitSalePrice, 'unitSalePrice');

    this._id = params.id;
    this._bookId = params.bookId;
    this._bookTitleSnapshot = params.bookTitleSnapshot;
    this._quantity = params.quantity;
    this._unitCostPrice = params.unitCostPrice;
    this._unitSalePrice = params.unitSalePrice;
    this._totalRevenue = params.totalRevenue ?? params.unitSalePrice * params.quantity;
    this._totalCost = params.totalCost ?? params.unitCostPrice * params.quantity;
    this._profit = params.profit ?? this._totalRevenue - this._totalCost;
    this._saleDate = params.saleDate || new Date();
    this._createdAt = params.createdAt || new Date();
    this._updatedAt = params.updatedAt || new Date();
  }

  // --- GETTERS ---
  get id(): string {
    return this._id;
  }
  get bookId(): string {
    return this._bookId;
  }
  get bookTitleSnapshot(): string {
    return this._bookTitleSnapshot;
  }
  get quantity(): number {
    return this._quantity;
  }
  get unitCostPrice(): number {
    return this._unitCostPrice;
  }
  get unitSalePrice(): number {
    return this._unitSalePrice;
  }
  get totalRevenue(): number {
    return this._totalRevenue;
  }
  get totalCost(): number {
    return this._totalCost;
  }
  get profit(): number {
    return this._profit;
  }
  get saleDate(): Date {
    return this._saleDate;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // --- VALIDATIONS ---

  private validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainException('A quantidade vendida deve ser um número inteiro positivo.', 'INVALID_QUANTITY');
    }
  }

  private validateNonNegative(value: number, field: string): void {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      throw new DomainException(`O campo ${field} deve ser um número maior ou igual a zero.`, 'INVALID_PRICE');
    }
  }
}
