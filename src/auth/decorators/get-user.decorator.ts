import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest().user;
  if (!req) throw new BadRequestException('Usuario no encontrado');
  if (data === 'id') return req[data];
  return req;
});
