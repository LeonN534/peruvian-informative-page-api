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

  findComentariesByTopic(topic: string) {
    return `This action returns a #${topic} commentary`;
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

  removeComentary(id: number) {
    return `This action removes a #${id} commentary`;
  }
}
