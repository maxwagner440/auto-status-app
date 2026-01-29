import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthGuard extends PassportAuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }

    // Extract shopKey from route parameter
    const request = context.switchToHttp().getRequest();
    const routeShopKey = request.params?.shopKey;
    if (!routeShopKey) {
      throw new UnauthorizedException('Shop key required');
    }

    // Ensure token shopKey matches route shopKey
    if (user.shopKey !== routeShopKey) {
      throw new UnauthorizedException('Shop key mismatch');
    }

    return user;
  }
}

