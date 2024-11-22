import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { InstructiveEmail } from './entities/instructive-email.entity';
import { TokenService } from './token.service';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import transporter from './helpers/mailer.helper';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(InstructiveEmail)
    private readonly instructiveEmailRepository: Repository<InstructiveEmail>,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.signAsync(payload);
    return token;
  }

  async createUser(createUserDto: CreateUserDto) {
    const userExist = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (userExist)
      throw new BadRequestException(
        'Ya existe un usuario registrado con ese correo.',
      );

    const hash = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.userRepository.create({
      email: createUserDto.email,
      password: hash,
      fullName: createUserDto.fullName,
    });

    try {
      await this.userRepository.save(newUser);
    } catch (error: any) {
      console.error(
        `Database error occurred: ${error.code}: ${
          error.detail || error.message
        }`,
      );
    }
    const jwtToken = await this.getJwtToken({
      sub: newUser.id,
      iat: Date.now() / 1000,
    });
    delete newUser.password;
    return {
      status: 200,
      error: null,
      success: true,
      token: jwtToken,
    };
  }

  async findOneUser(uuid: string) {
    const user = await this.userRepository.findOne({
      where: { id: uuid },
      relations: ['commentaries'],
    });

    if (!user)
      throw new BadRequestException(
        `User with id ${uuid} does not exist in the database.`,
      );

    return {
      status: 200,
      error: null,
      success: true,
      data: user,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: {
        email: true,
        password: true,
        id: true,
        creationDate: true,
      },
    });

    if (!user)
      throw new BadRequestException(
        'No existe un usuario registrado con ese correo.',
      );

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException('La contraseña es incorrecta.');

    const jwtToken = await this.getJwtToken({
      sub: user.id,
      iat: Date.now() / 1000,
    });

    delete user.password;
    return {
      status: 200,
      error: null,
      success: true,
      token: jwtToken,
    };
  }

  async createRestorePasswordEmail(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user)
      throw new BadRequestException(
        'No existe un usuario registrado con ese correo.',
      );

    const MAX_EMAIL_SEND_LIMIT = 3;
    const EMAIL_EXPIRATION_DURATION = 20 * 60 * 1000;

    let instructiveEmail = await this.instructiveEmailRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    const token = this.tokenService.generateToken();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10);

    if (instructiveEmail) {
      const currentTime = new Date().getTime();
      const lastSentTime = instructiveEmail.lastSentTime.getTime();
      const elapsedSinceLastSend = currentTime - lastSentTime;

      if (elapsedSinceLastSend >= EMAIL_EXPIRATION_DURATION) {
        instructiveEmail.emailSendCount = 1;
        instructiveEmail.token = token;
        instructiveEmail.tokenExpiration = expires;
      } else {
        if (instructiveEmail.emailSendCount >= MAX_EMAIL_SEND_LIMIT) {
          throw new BadRequestException(
            'Se ha alcanzado el límite de reenvío de correo electrónico, espere 20 minutos',
          );
        }
        instructiveEmail.token = token;
        instructiveEmail.tokenExpiration = expires;
        instructiveEmail.emailSendCount += 1;
      }
      instructiveEmail.lastSentTime = new Date();
    } else {
      instructiveEmail = this.instructiveEmailRepository.create({
        email: forgotPasswordDto.email,
        emailSendCount: 1,
        lastSentTime: new Date(),
        token,
        tokenExpiration: expires,
      });
    }

    try {
      await this.instructiveEmailRepository.save(instructiveEmail);
    } catch (error: any) {
      console.error(error);
    }

    const forgotPasswordUrl = `${this.configService.get('FRONTEND_URL')}/forgot-password/restore?token=${token}`;

    const mailOptions = {
      from: 'Realidad Nacional Página web <noreply@realidadnacional.com>',
      to: forgotPasswordDto.email,
      subject: 'Recuperación de contraseña',
      text: `A continuación encontrará un botón que lo llevará a la página para restaurar sucontraseña. 
      Esta página tiene una uración de 20 minutos a partir de su creación, por lo que ya no podrá acceder a él pasado ese tiempo, en cuyo caso, deberá solicitar otro email de recuperación. 
      ${forgotPasswordUrl}`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error: any) {
      console.error(error);
    }

    return {
      status: 201,
      error: null,
      success: true,
      message: 'Email sent with instructions to reset password.',
    };
  }

  async validateJwt(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user)
      throw new BadRequestException(
        'No existe un usuario registrado con la información proporcionada.',
      );

    return {
      status: 200,
      error: null,
      success: true,
      data: user,
    };
  }

  async restorePassword(token: string, restorePasswordDto: RestorePasswordDto) {
    const userEmail = (
      await this.tokenService.validateRestorePasswordToken(token)
    ).data.email;
    const user = await this.userRepository.findOne({
      where: { email: userEmail },
      select: { email: true, id: true, creationDate: true, password: true },
    });

    const newPassword = restorePasswordDto.password;

    const isPasswordValid = await bcrypt.compare(newPassword, user.password);

    if (isPasswordValid)
      throw new UnauthorizedException(
        'La nueva contraseña no puede ser igual a la anterior.',
      );

    const hash = await bcrypt.hash(newPassword, 10);

    try {
      await this.userRepository.update(user.id, { password: hash });
      await this.instructiveEmailRepository.delete({ email: userEmail });
    } catch (error: any) {
      console.error(
        `Database error occurred: ${error.code}: ${
          error.detail || error.message
        }`,
      );
    }

    delete user.password;

    return {
      status: 201,
      error: null,
      success: true,
      message: 'Password restored successfully.',
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { email: true, id: true, creationDate: true, password: true },
    });

    if (!user)
      throw new BadRequestException(
        'No existe un usuario registrado con la información proporcionada.',
      );

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid)
      throw new UnauthorizedException('La contraseña actual no es correcta.');

    const newPassword = changePasswordDto.newPassword;

    const isPasswordValid = await bcrypt.compare(newPassword, user.password);

    if (isPasswordValid)
      throw new UnauthorizedException(
        'La nueva contraseña no puede ser igual a la anterior.',
      );

    const hash = await bcrypt.hash(newPassword, 10);

    try {
      await this.userRepository.update(user.id, { password: hash });
    } catch (error: any) {
      console.error(
        `Database error occurred: ${error.code}: ${
          error.detail || error.message
        }`,
      );
    }

    delete user.password;

    return {
      status: 200,
      error: null,
      success: true,
      message: 'Password changed successfully.',
    };
  }

  async getValidatedUser(jwt: string) {
    if (!jwt) throw new UnauthorizedException('Not authorized');

    if (jwt.startsWith('Bearer ')) jwt = jwt.slice(7, jwt.length);

    try {
      const payload = await this.jwtService.verifyAsync(jwt);
      if (!payload) throw new UnauthorizedException('Not authorized');

      const userId = payload.sub;
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) throw new UnauthorizedException('Not authorized');

      return user;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Not authorized');
    }
  }
}
