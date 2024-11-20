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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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
