import { Body, Controller, Get, Param, Put, UseGuards, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ShopEntity } from "./entities/shop.entity";
import { AuthGuard } from "./auth/auth.guard";

type ShopPayload = { name?: string; phone?: string; hours?: string; primaryContactName?: string | null };

@Controller("api/admin")
@UseGuards(AuthGuard)
export class ShopController {
  constructor(
    @InjectRepository(ShopEntity) private readonly shopRepo: Repository<ShopEntity>,
  ) {}

  private async getShopByKey(shopKey: string): Promise<ShopEntity> {
    const shop = await this.shopRepo.findOne({ where: { shopKey } });
    if (!shop) {
      throw new HttpException("Shop not found", HttpStatus.NOT_FOUND);
    }
    return shop;
  }

  @Get(":shopKey/shop")
  async getShop(@Param("shopKey") shopKey: string) {
    return this.getShopByKey(shopKey);
  }

  @Put(":shopKey/shop")
  async updateShop(@Param("shopKey") shopKey: string, @Body() body: ShopPayload) {
    const shop = await this.getShopByKey(shopKey);
    shop.name = String(body.name ?? shop.name ?? "");
    shop.phone = String(body.phone ?? shop.phone ?? "");
    shop.hours = String(body.hours ?? shop.hours ?? "");
    if (body.primaryContactName !== undefined) {
      shop.primaryContactName = body.primaryContactName === null ? null : String(body.primaryContactName);
    }
    return this.shopRepo.save(shop);
  }
}
