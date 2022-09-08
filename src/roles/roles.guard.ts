import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../users/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const email = request.user?.email;

    if (!email) {
      return false;
    }

    const user = await this.userService.getOne({ email });

    if (!user) {
      return false;
    }

    return roles.some((role) => !!user.roles.find((userRole) => userRole === role));
  }
}
