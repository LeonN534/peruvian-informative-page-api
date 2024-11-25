import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class LoginUserDto {
  @IsString()
  @IsEmail()
  @Trim()
  email: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  password: string;
}
