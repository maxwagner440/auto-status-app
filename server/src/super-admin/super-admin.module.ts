import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { ShopEntity } from "../entities/shop.entity";
import { SuperAdminShopsController } from "./super-admin-shops.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ShopEntity]), AuthModule],
  controllers: [SuperAdminShopsController],
})
export class SuperAdminModule {}
