import { Module } from '@nestjs/common';
import { CommentariesService } from './commentaries.service';
import { CommentariesController } from './commentaries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commentary } from './entities/commentary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commentary])],
  controllers: [CommentariesController],
  providers: [CommentariesService],
})
export class CommentariesModule {}
