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

@Injectable()
export class CommentariesService {
  constructor(
    @InjectRepository(Commentary)
    private commentariesRepository: Repository<Commentary>,
    private readonly authService: AuthService,
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

  async removeComentary(
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

    await this.commentariesRepository.remove(commentary);

    return {
      status: 204,
      error: null,
      success: true,
    };
  }
}
