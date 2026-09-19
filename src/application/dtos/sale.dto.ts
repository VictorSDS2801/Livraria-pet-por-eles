import { IsInt, IsMongoId, IsOptional, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleDTO {
  @ApiProperty({ example: '69b955d314e595522d5d3eb4', description: 'id do livro' })
  @IsMongoId({ message: 'O bookId deve ser um ObjectId válido.' })
  bookId: string;

  @ApiProperty({ example: 2, description: 'quantidade de unidades vendidas' })
  @IsInt({ message: 'O quantity deve ser um número inteiro.' })
  @Min(1, { message: 'O quantity deve ser no mínimo 1.' })
  @Type(() => Number)
  quantity: number;
}

export class FindAllSaleDTO {
  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
