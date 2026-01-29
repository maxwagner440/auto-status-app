import { Controller, Post, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ShopEntity } from '../entities/shop.entity';
import { JwtPayload } from './jwt.strategy';

type LoginDto = { password: string };

@Controller('api/auth')
export class AuthController {
  constructor(
    @InjectRepository(ShopEntity) private readonly shopRepo: Repository<ShopEntity>,
    private readonly jwtService: JwtService,
  ) {}

  @Post(':shopKey/login')
  async login(@Param('shopKey') shopKey: string, @Body() body: LoginDto) {
    if (!body.password) {
      throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
    }

    const shop = await this.shopRepo.findOne({ where: { shopKey } });
    if (!shop) {
      // Do not reveal shop existence - return 404
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(body.password, shop.passwordHash);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Generate JWT token
    const payload: JwtPayload = {
      shopKey: shop.shopKey,
      sub: shop.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}

