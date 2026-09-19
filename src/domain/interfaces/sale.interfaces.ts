export interface ISale {
  id?: string;
  bookId: string;
  bookTitleSnapshot: string;
  quantity: number;
  unitCostPrice: number;
  unitSalePrice: number;
  totalRevenue?: number;
  totalCost?: number;
  profit?: number;
  saleDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISaleParameters {
  bookId: string;
  quantity: number;
}

export interface ISaleFilters {
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface IProfitSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  salesCount: number;
}
