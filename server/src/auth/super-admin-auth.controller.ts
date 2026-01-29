import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';

type LoginDto = { username: string; password: string };

@Controller('api/super-admin/auth')
export class SuperAdminAuthController {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const username = body?.username != null ? String(body.username).trim() : '';
    const password = body?.password != null ? String(body.password) : '';

    if (!username || !password) {
      throw new HttpException('Username and password are required', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const payload = { sub: user.id, role: 'super_admin' as const };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
