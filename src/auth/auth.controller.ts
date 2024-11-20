import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { RestorePasswordDto } from './dto/restore-password.dto';
import { TokenService } from './token.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  createUser(@Body() createAuthDto: CreateUserDto) {
    return this.authService.createUser(createAuthDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('forgot-password')
  createRestorePasswordEmail(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.createRestorePasswordEmail(forgotPasswordDto);
  }

  @Post('forgot-password/restore')
  restorePassword(
    @Query('token') token: string,
    @Body() restorePasswordDto: RestorePasswordDto,
  ) {
    return this.authService.restorePassword(token, restorePasswordDto);
  }

  @Post('forgot-password/validate-token')
  validateRestorePasswordToken(@Query('token') token: string) {
    return this.tokenService.validateRestorePasswordToken(token);
  }

  @UseGuards(AuthGuard())
  @Post('change-password')
  changePassword(
    @GetUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }

  @UseGuards(AuthGuard())
  @Get('validate-jwt')
  validateJwt(@GetUser() userId: string) {
    return this.authService.validateJwt(userId);
  }
}
