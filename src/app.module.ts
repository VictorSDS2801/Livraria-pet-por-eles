import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { MongooseModule } from '@nestjs/mongoose';
import { BookController } from './application/controllers/book.controller';
import { SaleController } from './application/controllers/sale.controller';
import { ReportController } from './application/controllers/report.controller';
import { BookService } from './domain/services/book.service';
import { SaleService } from './domain/services/sale.service';
import { ReportService } from './domain/services/report.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import {
  getRequestCorrelationId,
  resolveCorrelationId,
  setCorrelationIdHeader,
} from './shared/observability/correlation-id';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req, res) => {
          const requestId = resolveCorrelationId(req.headers);
          setCorrelationIdHeader(res, requestId);
          return requestId;
        },
        customProps: (req) => ({
          correlationId: getRequestCorrelationId(req),
        }),
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
      },
    }),
    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri = process.env.MONGO_URI;
        if (!uri) {
          throw new Error(
            'MONGO_URI não definida. Copie .env.example para .env e cole sua connection string do MongoDB Atlas.',
          );
        }
        return { uri };
      },
    }),
    DatabaseModule,
  ],
  controllers: [BookController, SaleController, ReportController],
  providers: [BookService, SaleService, ReportService],
})
export class AppModule {}
