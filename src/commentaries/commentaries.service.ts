import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentaryDto } from './dto/create-commentary.dto';
import { UpdateCommentaryDto } from './dto/update-commentary.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Commentary } from './entities/commentary.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Topics } from './enums/topics.enum';
import { Votes } from './enums/votes.enum.';
import { CommentariesVotedByUsers } from './entities/commentaries-voted-by-users.entity';

@Injectable()
export class CommentariesService {
  constructor(
    @InjectRepository(Commentary)
    private commentariesRepository: Repository<Commentary>,
    private readonly authService: AuthService,
    @InjectRepository(CommentariesVotedByUsers)
    private commentariesVotedByUsersRepository: Repository<CommentariesVotedByUsers>,
  ) {}
  async createComentary(
    createCommentaryDto: CreateCommentaryDto,
    userId: string,
  ) {
    const user = (await this.authService.findOneUser(userId)).data;

    const newCommentary = new Commentary();
    newCommentary.user = user;
    newCommentary.topic = createCommentaryDto.topic;
    newCommentary.content = createCommentaryDto.content;

    await this.commentariesRepository.save(newCommentary);

    return {
      status: 201,
      error: null,
      success: true,
    };
  }

  async findComentariesByTopic(topic: string, paginationDto: PaginationDto) {
    if (!Object.values(Topics).includes(topic as unknown as Topics))
      throw new BadRequestException('Invalid topic');

    const commentaries = await this.commentariesRepository.find({
      where: { topic: topic as unknown as Topics },
      relations: ['user'],
      skip: paginationDto.offset,
      take: paginationDto.limit,
      order: { creationDate: 'DESC' },
    });

    return {
      status: 200,
      error: null,
      success: true,
      data: commentaries,
    };
  }

  async updateComentary(
    id: number,
    updateCommentaryDto: UpdateCommentaryDto,
    jwt: string,
  ) {
    if (!id) throw new BadRequestException('Commentary id is required');

    const user = await this.authService.getValidatedUser(jwt);
    const commentary = await this.commentariesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!commentary) throw new BadRequestException('Commentary not found');

    if (commentary.user.id !== user.id)
      throw new UnauthorizedException('This commentary is not yours');

    commentary.content = updateCommentaryDto.content;
    await this.commentariesRepository.save(commentary);

    return {
      status: 201,
      error: null,
      success: true,
    };
  }

  async removeComentary(id: number, jwt: string) {
    if (!id) throw new BadRequestException('Commentary id is required');

    const user = await this.authService.getValidatedUser(jwt);
    const commentary = await this.commentariesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!commentary) throw new BadRequestException('Commentary not found');

    if (commentary.user.id !== user.id)
      throw new UnauthorizedException('This commentary is not yours');

    await this.commentariesRepository.remove(commentary);

    return {
      status: 204,
      error: null,
      success: true,
    };
  }

  async voteComentaryUp(id: number, jwt: string) {
    if (!id) throw new BadRequestException('Commentary id is required');

    const user = await this.authService.getValidatedUser(jwt);
    const commentary = await this.commentariesRepository.findOne({
      where: { id },
    });

    if (!commentary) throw new BadRequestException('Commentary not found');

    const existingVote = commentary.commentariesVotedByUsers.find(
      (vote) => vote.userId === user.id,
    );

    if (existingVote) {
      if (existingVote.vote === Votes.UP)
        throw new BadRequestException(
          'You have already voted up this commentary',
        );

      // Update the vote to UP if the existing vote is not UP
      existingVote.vote = Votes.UP;
      await this.commentariesVotedByUsersRepository.save(existingVote);
    } else {
      const newCommentaryVote = new CommentariesVotedByUsers();
      newCommentaryVote.user = user;
      newCommentaryVote.commentary = commentary;
      newCommentaryVote.vote = Votes.UP;
      newCommentaryVote.userId = user.id;
      newCommentaryVote.commentaryId = commentary.id;

      await this.commentariesVotedByUsersRepository.save(newCommentaryVote);
    }

    return {
      status: 200,
      error: null,
      success: true,
    };
  }

  async voteComentaryDown(id: number, jwt: string) {
    if (!id) throw new BadRequestException('Commentary id is required');

    const user = await this.authService.getValidatedUser(jwt);
    const commentary = await this.commentariesRepository.findOne({
      where: { id },
    });

    if (!commentary) throw new BadRequestException('Commentary not found');
    const existingVote = commentary.commentariesVotedByUsers.find(
      (vote) => vote.userId === user.id,
    );

    if (existingVote) {
      if (existingVote.vote === Votes.DOWN)
        throw new BadRequestException(
          'You have already voted down this commentary',
        );

      // Update the vote to Down if the existing vote is not DOWN
      existingVote.vote = Votes.DOWN;
      await this.commentariesVotedByUsersRepository.save(existingVote);
    } else {
      const newCommentaryVote = new CommentariesVotedByUsers();
      newCommentaryVote.user = user;
      newCommentaryVote.commentary = commentary;
      newCommentaryVote.vote = Votes.DOWN;
      newCommentaryVote.userId = user.id;
      newCommentaryVote.commentaryId = commentary.id;

      await this.commentariesVotedByUsersRepository.save(newCommentaryVote);
    }

    return {
      status: 200,
      error: null,
      success: true,
    };
  }
}
