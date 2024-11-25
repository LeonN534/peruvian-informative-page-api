import { Module } from '@nestjs/common';
import { CommentariesService } from './commentaries.service';
import { CommentariesController } from './commentaries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commentary } from './entities/commentary.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CommentariesVotedByUsers } from './entities/commentaries-voted-by-users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Commentary, CommentariesVotedByUsers]),
    AuthModule,
  ],
  controllers: [CommentariesController],
  providers: [CommentariesService],
  exports: [TypeOrmModule],
})
export class CommentariesModule {}
