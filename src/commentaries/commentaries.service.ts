import { Injectable } from '@nestjs/common';
import { CreateCommentaryDto } from './dto/create-commentary.dto';
import { UpdateCommentaryDto } from './dto/update-commentary.dto';

@Injectable()
export class CommentariesService {
  create(createCommentaryDto: CreateCommentaryDto) {
    return 'This action adds a new commentary';
  }

  findAll() {
    return `This action returns all commentaries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commentary`;
  }

  update(id: number, updateCommentaryDto: UpdateCommentaryDto) {
    return `This action updates a #${id} commentary`;
  }

  remove(id: number) {
    return `This action removes a #${id} commentary`;
  }
}
