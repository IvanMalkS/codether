import { PartialType } from '@nestjs/mapped-types';
import { CreateCodeDto } from './create-code.dto';

export class UpdateCodeDto extends PartialType(CreateCodeDto) {
  updatePassword: string;
  code: string;
}
