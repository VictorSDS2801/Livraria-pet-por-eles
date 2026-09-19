import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SaleDocument = SaleModel & Document;

@Schema({ collection: 'sales', timestamps: true })
export class SaleModel {
  @Prop({ type: Types.ObjectId, required: true })
  bookId: Types.ObjectId;

  // Campos "fotografia": preservados mesmo se o livro for editado/inativado depois.
  @Prop({ type: String, required: true, trim: true })
  bookTitleSnapshot: string;

  @Prop({ type: Number, required: true, min: 1 })
  quantity: number;

  @Prop({ type: Number, required: true, min: 0 })
  unitCostPrice: number;

  @Prop({ type: Number, required: true, min: 0 })
  unitSalePrice: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalRevenue: number;

  @Prop({ type: Number, required: true, min: 0 })
  totalCost: number;

  @Prop({ type: Number, required: true })
  profit: number;

  @Prop({ type: Date, required: true })
  saleDate: Date;

  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = SchemaFactory.createForClass(SaleModel);

SaleSchema.index({ saleDate: -1 });
SaleSchema.index({ bookId: 1 });

export { SaleSchema };
