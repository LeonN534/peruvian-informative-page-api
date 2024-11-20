import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommentariesService } from './commentaries.service';
import { CreateCommentaryDto } from './dto/create-commentary.dto';
import { UpdateCommentaryDto } from './dto/update-commentary.dto';

@Controller('commentaries')
export class CommentariesController {
  constructor(private readonly commentariesService: CommentariesService) {}

  @Post()
  create(@Body() createCommentaryDto: CreateCommentaryDto) {
    return this.commentariesService.create(createCommentaryDto);
  }

  @Get()
  findAll() {
    return this.commentariesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentariesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentaryDto: UpdateCommentaryDto) {
    return this.commentariesService.update(+id, updateCommentaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentariesService.remove(+id);
  }
}
