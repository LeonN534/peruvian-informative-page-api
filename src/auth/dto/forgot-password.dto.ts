import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class ForgotPasswordDto {
  @IsString()
  @IsEmail()
  @Trim()
  @IsNotEmpty()
  email: string;
}
