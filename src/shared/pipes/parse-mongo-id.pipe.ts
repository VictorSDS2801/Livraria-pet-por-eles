import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!isValidObjectId(value)) {
      throw new BadRequestException('O id deve ser um ObjectId válido.');
    }
    return value;
  }
}
