import { DomainException } from '../exceptions/domain.exception';
import { IBook, BookCategory } from '../interfaces/book.interfaces';

const VALID_CATEGORIES: BookCategory[] = [
  'FICTION',
  'NON_FICTION',
  'TECHNICAL',
  'CHILDREN',
  'ACADEMIC',
  'BIOGRAPHY',
  'OTHER',
];

export class Book {
  private _id: string;
  private _title: string;
  private _author: string;
  private _category: BookCategory;
  private _costPrice: number;
  private _salePrice: number;
  private _stock: number;
  private _active: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: IBook) {
    this.validateTitle(params.title);
    this.validateAuthor(params.author);
    this.validateCategory(params.category);
    this.validatePrice(params.costPrice, 'costPrice');
    this.validatePrice(params.salePrice, 'salePrice');
    this.validateStock(params.stock);

    this._id = params.id;
    this._title = params.title.trim();
    this._author = params.author.trim();
    this._category = params.category;
    this._costPrice = params.costPrice;
    this._salePrice = params.salePrice;
    this._stock = params.stock;
    this._active = params.active ?? true;
    this._createdAt = params.createdAt || new Date();
    this._updatedAt = params.updatedAt || new Date();
  }

  // --- GETTERS ---
  get id(): string {
    return this._id;
  }
  get title(): string {
    return this._title;
  }
  get author(): string {
    return this._author;
  }
  get category(): BookCategory {
    return this._category;
  }
  get costPrice(): number {
    return this._costPrice;
  }
  get salePrice(): number {
    return this._salePrice;
  }
  get stock(): number {
    return this._stock;
  }
  get active(): boolean {
    return this._active;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // --- DOMAIN BEHAVIORS ---

  public updateDetails(data: {
    title?: string;
    author?: string;
    category?: BookCategory;
    costPrice?: number;
    salePrice?: number;
    stock?: number;
  }): void {
    if (data.title !== undefined) {
      this.validateTitle(data.title);
      this._title = data.title.trim();
    }
    if (data.author !== undefined) {
      this.validateAuthor(data.author);
      this._author = data.author.trim();
    }
    if (data.category !== undefined) {
      this.validateCategory(data.category);
      this._category = data.category;
    }
    if (data.costPrice !== undefined) {
      this.validatePrice(data.costPrice, 'costPrice');
      this._costPrice = data.costPrice;
    }
    if (data.salePrice !== undefined) {
      this.validatePrice(data.salePrice, 'salePrice');
      this._salePrice = data.salePrice;
    }
    if (data.stock !== undefined) {
      this.validateStock(data.stock);
      this._stock = data.stock;
    }
    this.updateTimeStamp();
  }

  /**
   * Debita `quantity` unidades do estoque.
   * Lança DomainException se não houver estoque suficiente — é essa regra
   * que impede uma venda de deixar o estoque negativo.
   */
  public decreaseStock(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainException('A quantidade deve ser um número inteiro positivo.', 'INVALID_QUANTITY');
    }
    if (quantity > this._stock) {
      throw new DomainException(
        `Estoque insuficiente para "${this._title}": solicitado ${quantity}, disponível ${this._stock}.`,
        'INSUFFICIENT_STOCK',
      );
    }
    this._stock -= quantity;
    this.updateTimeStamp();
  }

  public deactivate(): void {
    if (!this._active) {
      throw new DomainException('Livro já está inativo.', 'ALREADY_INACTIVE');
    }
    this._active = false;
    this.updateTimeStamp();
  }

  public hasStockFor(quantity: number): boolean {
    return this._stock >= quantity;
  }

  // --- VALIDATIONS ---

  private validateTitle(title: string): void {
    if (!title || !title.trim()) {
      throw new DomainException('O título do livro é obrigatório.', 'INVALID_TITLE');
    }
  }

  private validateAuthor(author: string): void {
    if (!author || !author.trim()) {
      throw new DomainException('O autor do livro é obrigatório.', 'INVALID_AUTHOR');
    }
  }

  private validateCategory(category: BookCategory): void {
    if (!VALID_CATEGORIES.includes(category)) {
      throw new DomainException(
        `Categoria inválida "${category}". Valores aceitos: ${VALID_CATEGORIES.join(', ')}.`,
        'INVALID_CATEGORY',
      );
    }
  }

  private validatePrice(price: number, field: string): void {
    if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      throw new DomainException(`O campo ${field} deve ser um número maior ou igual a zero.`, 'INVALID_PRICE');
    }
  }

  private validateStock(stock: number): void {
    if (!Number.isInteger(stock) || stock < 0) {
      throw new DomainException('O estoque deve ser um número inteiro maior ou igual a zero.', 'INVALID_STOCK');
    }
  }

  private updateTimeStamp(): void {
    this._updatedAt = new Date();
  }
}
