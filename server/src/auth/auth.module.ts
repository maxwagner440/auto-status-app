import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtSuperAdminStrategy } from './jwt-super-admin.strategy';
import { AuthGuard } from './auth.guard';
import { SuperAdminGuard } from './super-admin.guard';
import { SuperAdminAuthController } from './super-admin-auth.controller';
import { ShopEntity } from '../entities/shop.entity';
import { UserEntity } from '../entities/user.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([ShopEntity, UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, SuperAdminAuthController],
  providers: [JwtStrategy, JwtSuperAdminStrategy, AuthGuard, SuperAdminGuard],
  exports: [AuthGuard, SuperAdminGuard, JwtModule],
})
export class AuthModule {}

