import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookModel, BookSchema } from './schemas/book.schema';
import { SaleModel, SaleSchema } from './schemas/sale.schema';
import { BookMongoRepository } from './repositories/book-mongo.repository';
import { SaleMongoRepository } from './repositories/sale-mongo.repository';
import { I_BOOK_REPOSITORY } from '../../domain/repositories/book.repository.interface';
import { I_SALE_REPOSITORY } from '../../domain/repositories/sale.repository.interface';

@Module({
  imports: [
    // Não força o forRoot aqui. Isso fica a cargo do AppModule.
    MongooseModule.forFeature([
      { name: BookModel.name, schema: BookSchema },
      { name: SaleModel.name, schema: SaleSchema },
    ]),
  ],
  providers: [
    { provide: I_BOOK_REPOSITORY, useClass: BookMongoRepository },
    { provide: I_SALE_REPOSITORY, useClass: SaleMongoRepository },
  ],
  exports: [I_BOOK_REPOSITORY, I_SALE_REPOSITORY],
})
export class DatabaseModule {}
