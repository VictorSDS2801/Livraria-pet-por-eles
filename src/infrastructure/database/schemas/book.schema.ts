import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BookCategory } from '../../../domain/interfaces/book.interfaces';

export type BookDocument = BookModel & Document;

@Schema({ collection: 'books', timestamps: true })
export class BookModel {
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, required: true, trim: true })
  author: string;

  @Prop({
    type: String,
    required: true,
    enum: ['FICTION', 'NON_FICTION', 'TECHNICAL', 'CHILDREN', 'ACADEMIC', 'BIOGRAPHY', 'OTHER'],
  })
  category: BookCategory;

  @Prop({ type: Number, required: true, min: 0 })
  costPrice: number;

  @Prop({ type: Number, required: true, min: 0 })
  salePrice: number;

  @Prop({ type: Number, required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ type: Boolean, required: true, default: true })
  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = SchemaFactory.createForClass(BookModel);

// Índices para as buscas por título/autor (regex) e filtro por categoria/status.
BookSchema.index({ title: 1 });
BookSchema.index({ author: 1 });
BookSchema.index({ category: 1 });
BookSchema.index({ active: 1 });

export { BookSchema };
