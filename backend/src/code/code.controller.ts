import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { CodeService } from './code.service';
import { CreateCodeDto } from './dto/create-code.dto';
import { UpdateCodeDto } from './dto/update-code.dto';
import { FindCodeDto } from './dto/find-code.dto';

@Controller('code')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Post('/create')
  create(@Body() createCodeDto: CreateCodeDto) {
    return this.codeService.create(createCodeDto);
  }

  @Post('/get/:id')
  findOne(@Param('id') id: string, @Body() findCodeDto: FindCodeDto) {
    return this.codeService.findOne(+id, findCodeDto);
  }

  @Patch('/update/:id')
  update(@Param('id') id: string, @Body() updateCodeDto: UpdateCodeDto) {
    return this.codeService.update(+id, updateCodeDto);
  }
}
