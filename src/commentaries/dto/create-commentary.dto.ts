import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';
import { Topics } from '../enums/topics.enum';

export class CreateCommentaryDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  content: string;

  @Trim()
  @IsEnum(Topics)
  topic: Topics;
}
