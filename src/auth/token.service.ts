import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { InstructiveEmail } from './entities/instructive-email.entity';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(InstructiveEmail)
    private readonly instructiveEmailRepository: Repository<InstructiveEmail>,
  ) {}

  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  async validateRestorePasswordToken(token: string) {
    const resetToken = await this.instructiveEmailRepository.findOne({
      where: { token },
    });

    if (!resetToken || resetToken.tokenExpiration < new Date()) {
      throw new BadRequestException('Invalid token');
    }

    const emailUser = await this.userRepository.findOne({
      where: { email: resetToken.email },
      select: { email: true },
    });

    if (!emailUser) {
      throw new BadRequestException('Invalid token');
    }

    return { status: 200, error: null, success: true, data: emailUser };
  }
}
