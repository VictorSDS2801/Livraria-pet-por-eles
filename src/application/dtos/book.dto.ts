import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const BOOK_CATEGORIES = [
  'FICTION',
  'NON_FICTION',
  'TECHNICAL',
  'CHILDREN',
  'ACADEMIC',
  'BIOGRAPHY',
  'OTHER',
];

export class CreateBookDTO {
  @ApiProperty({ example: 'Dom Casmurro' })
  @IsString({ message: 'O title deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O title é obrigatório.' })
  title: string;

  @ApiProperty({ example: 'Machado de Assis' })
  @IsString({ message: 'O author deve ser uma string válida.' })
  @IsNotEmpty({ message: 'O author é obrigatório.' })
  author: string;

  @ApiProperty({ enum: BOOK_CATEGORIES, example: 'FICTION' })
  @IsIn(BOOK_CATEGORIES, { message: `O category deve ser um dos seguintes: ${BOOK_CATEGORIES.join(', ')}.` })
  category: string;

  @ApiProperty({ example: 19.9, description: 'Preço de custo (o quanto foi pago pelo livro)' })
  @IsNumber({}, { message: 'O costPrice deve ser um número.' })
  @Min(0, { message: 'O costPrice deve ser no mínimo 0.' })
  @Type(() => Number)
  costPrice: number;

  @ApiProperty({ example: 39.9, description: 'Preço de venda ao cliente' })
  @IsNumber({}, { message: 'O salePrice deve ser um número.' })
  @Min(0, { message: 'O salePrice deve ser no mínimo 0.' })
  @Type(() => Number)
  salePrice: number;

  @ApiProperty({ example: 10 })
  @IsInt({ message: 'O stock deve ser um número inteiro.' })
  @Min(0, { message: 'O stock deve ser no mínimo 0.' })
  @Type(() => Number)
  stock: number;
}

export class UpdateBookDTO {
  @ApiPropertyOptional({ example: 'Dom Casmurro' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({ example: 'Machado de Assis' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  author?: string;

  @ApiPropertyOptional({ enum: BOOK_CATEGORIES })
  @IsOptional()
  @IsIn(BOOK_CATEGORIES)
  category?: string;

  @ApiPropertyOptional({ example: 19.9 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  costPrice?: number;

  @ApiPropertyOptional({ example: 39.9 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  salePrice?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock?: number;
}

export class FindAllBookDTO {
  @ApiPropertyOptional({ description: 'Busca parcial (case-insensitive) pelo título' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Busca parcial (case-insensitive) pelo autor' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ enum: BOOK_CATEGORIES })
  @IsOptional()
  @IsIn(BOOK_CATEGORIES)
  category?: string;

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
