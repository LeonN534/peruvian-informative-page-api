import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { CommentariesService } from './commentaries.service';
import { CreateCommentaryDto } from './dto/create-commentary.dto';
import { UpdateCommentaryDto } from './dto/update-commentary.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('commentaries')
export class CommentariesController {
  constructor(private readonly commentariesService: CommentariesService) {}

  @UseGuards(AuthGuard())
  @Post()
  createComentary(
    @Body() createCommentaryDto: CreateCommentaryDto,
    @GetUser() userId: string,
  ) {
    return this.commentariesService.createComentary(
      createCommentaryDto,
      userId,
    );
  }

  @Get(':topic')
  findComentariesByTopic(@Param('topic') topic: string) {
    return this.commentariesService.findComentariesByTopic(topic);
  }

  @Patch(':id')
  updateComentary(
    @Param('id') id: string,
    @Body() updateCommentaryDto: UpdateCommentaryDto,
    @Headers('Authorization') jwt: string,
  ) {
    return this.commentariesService.updateComentary(
      +id,
      updateCommentaryDto,
      jwt,
    );
  }

  @Delete(':id')
  removeComentary(
    @Param('id') id: string,
    @Body() updateCommentaryDto: UpdateCommentaryDto,
    @Headers('Authorization') jwt: string,
  ) {
    return this.commentariesService.removeComentary(
      +id,
      updateCommentaryDto,
      jwt,
    );
  }
}
