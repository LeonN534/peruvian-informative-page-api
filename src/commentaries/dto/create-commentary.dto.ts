import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';
import { Topics } from '../enums/topics.enum';

export class CreateCommentaryDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MinLength(10, {
    message: 'Content is too short',
  })
  content: string;

  @Trim()
  @IsEnum(Topics)
  topic: Topics;
}
