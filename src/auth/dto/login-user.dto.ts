import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Trim } from 'src/common/decorators/trim.decorator';

export class LoginUserDto extends CreateUserDto {
  @IsString()
  @Trim()
  @IsNotEmpty()
  password: string;
}
