import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtSuperAdminPayload {
  sub: string;
  role: 'super_admin';
}

@Injectable()
export class JwtSuperAdminStrategy extends PassportStrategy(Strategy, 'jwt-super-admin') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: unknown): Promise<JwtSuperAdminPayload> {
    const p = payload as { sub?: string; role?: string };
    if (p?.role !== 'super_admin' || !p?.sub) {
      throw new UnauthorizedException('Invalid token');
    }
    return { sub: p.sub, role: 'super_admin' };
  }
}
