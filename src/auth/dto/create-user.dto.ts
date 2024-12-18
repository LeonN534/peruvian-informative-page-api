import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  @Trim()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(60)
  @Matches(
    /^(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]*$/,
    {
      message:
        'The password must contain at least one number and one special character.',
    },
  )
  @Trim()
  password: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  fullName: string;
}
