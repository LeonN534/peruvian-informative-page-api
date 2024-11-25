import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class UpdateCommentaryDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  @MinLength(10, {
    message: 'Content is too short',
  })
  content: string;
}
