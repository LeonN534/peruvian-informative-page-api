import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class UpdateCommentaryDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  content: string;
}
