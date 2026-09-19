export type BookCategory =
  | 'FICTION'
  | 'NON_FICTION'
  | 'TECHNICAL'
  | 'CHILDREN'
  | 'ACADEMIC'
  | 'BIOGRAPHY'
  | 'OTHER';

export interface IBook {
  id?: string;
  title: string;
  author: string;
  category: BookCategory;
  costPrice: number;
  salePrice: number;
  stock: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBookParameters {
  title: string;
  author: string;
  category: BookCategory;
  costPrice: number;
  salePrice: number;
  stock: number;
}

export interface IBookUpdateParameters {
  title?: string;
  author?: string;
  category?: BookCategory;
  costPrice?: number;
  salePrice?: number;
  stock?: number;
}

export interface IBookFilters {
  title?: string;
  author?: string;
  category?: BookCategory;
  page?: number;
  limit?: number;
}
