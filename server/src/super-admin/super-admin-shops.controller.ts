import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { ShopEntity } from "../entities/shop.entity";
import { SuperAdminGuard } from "../auth/super-admin.guard";

type ShopResponse = Omit<ShopEntity, "passwordHash"> & { deletedAt: Date | null };

function toResponse(shop: ShopEntity): ShopResponse {
  const { passwordHash: _h, ...rest } = shop;
  return { ...rest, deletedAt: shop.deletedAt ?? null };
}

type CreateShopDto = {
  name: string;
  phone: string;
  hours: string;
  primaryContactName?: string | null;
  password: string;
  shopKey?: string;
  requiresVerification?: boolean;
};

type UpdateShopDto = {
  name?: string;
  phone?: string;
  hours?: string;
  primaryContactName?: string | null;
  requiresVerification?: boolean;
};

function generateShopKey(): string {
  return crypto.randomBytes(8).toString("base64url");
}

@Controller("api/super-admin/shops")
@UseGuards(SuperAdminGuard)
export class SuperAdminShopsController {
  constructor(
    @InjectRepository(ShopEntity) private readonly shopRepo: Repository<ShopEntity>,
  ) {}

  @Get()
  async list(): Promise<ShopResponse[]> {
    const shops = await this.shopRepo.find({
      withDeleted: true,
      order: { createdAt: "DESC" },
    });
    return shops.map(toResponse);
  }

  @Get(":id")
  async get(@Param("id") id: string): Promise<ShopResponse> {
    const shop = await this.shopRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!shop) {
      throw new HttpException("Shop not found", HttpStatus.NOT_FOUND);
    }
    return toResponse(shop);
  }

  @Post()
  async create(@Body() body: CreateShopDto): Promise<ShopResponse> {
    const name = body?.name != null ? String(body.name).trim() : "";
    const phone = body?.phone != null ? String(body.phone).trim() : "";
    const hours = body?.hours != null ? String(body.hours).trim() : "";
    const password = body?.password != null ? String(body.password) : "";

    if (!name || !phone || !hours || !password) {
      throw new HttpException(
        "name, phone, hours, and password are required",
        HttpStatus.BAD_REQUEST,
      );
    }

    let shopKey: string;
    if (body.shopKey != null && String(body.shopKey).trim()) {
      shopKey = String(body.shopKey).trim();
      if (!/^[a-z0-9_-]+$/i.test(shopKey)) {
        throw new HttpException(
          "shopKey must be alphanumeric, hyphens, or underscores only",
          HttpStatus.BAD_REQUEST,
        );
      }
      const existing = await this.shopRepo.findOne({
        where: { shopKey },
        withDeleted: true,
      });
      if (existing) {
        throw new HttpException(
          "A shop with this shopKey already exists",
          HttpStatus.CONFLICT,
        );
      }
    } else {
      let generated: string | null = null;
      for (let i = 0; i < 10; i++) {
        const candidate = generateShopKey();
        const existing = await this.shopRepo.findOne({
          where: { shopKey: candidate },
          withDeleted: true,
        });
        if (!existing) {
          generated = candidate;
          break;
        }
      }
      if (!generated) {
        throw new HttpException(
          "Could not generate unique shopKey; please provide one",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      shopKey = generated;
    }

    const primaryContactName =
      body.primaryContactName === null || body.primaryContactName === undefined
        ? null
        : String(body.primaryContactName || "").trim() || null;
    const requiresVerification = Boolean(body.requiresVerification);
    const passwordHash = await bcrypt.hash(password, 10);

    const shop = this.shopRepo.create({
      shopKey,
      name,
      phone,
      hours,
      primaryContactName,
      passwordHash,
      requiresVerification,
    });
    const saved = await this.shopRepo.save(shop);
    return toResponse(saved);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateShopDto,
  ): Promise<ShopResponse> {
    const shop = await this.shopRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!shop) {
      throw new HttpException("Shop not found", HttpStatus.NOT_FOUND);
    }
    if (shop.deletedAt) {
      throw new HttpException(
        "Cannot update a soft-deleted shop; restore it first",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (body.name !== undefined) {
      const v = String(body.name ?? "").trim();
      if (!v) throw new HttpException("name cannot be empty", HttpStatus.BAD_REQUEST);
      shop.name = v;
    }
    if (body.phone !== undefined) {
      const v = String(body.phone ?? "").trim();
      if (!v) throw new HttpException("phone cannot be empty", HttpStatus.BAD_REQUEST);
      shop.phone = v;
    }
    if (body.hours !== undefined) {
      const v = String(body.hours ?? "").trim();
      if (!v) throw new HttpException("hours cannot be empty", HttpStatus.BAD_REQUEST);
      shop.hours = v;
    }
    if (body.primaryContactName !== undefined) {
      shop.primaryContactName =
        body.primaryContactName === null
          ? null
          : String(body.primaryContactName || "").trim() || null;
    }
    if (body.requiresVerification !== undefined) {
      shop.requiresVerification = Boolean(body.requiresVerification);
    }

    const saved = await this.shopRepo.save(shop);
    return toResponse(saved);
  }

  @Delete(":id")
  async softDelete(@Param("id") id: string): Promise<{ deleted: true }> {
    const shop = await this.shopRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!shop) {
      throw new HttpException("Shop not found", HttpStatus.NOT_FOUND);
    }
    if (shop.deletedAt) {
      throw new HttpException("Shop is already soft-deleted", HttpStatus.BAD_REQUEST);
    }
    await this.shopRepo.softRemove(shop);
    return { deleted: true };
  }

  @Post(":id/restore")
  async restore(@Param("id") id: string): Promise<ShopResponse> {
    const shop = await this.shopRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!shop) {
      throw new HttpException("Shop not found", HttpStatus.NOT_FOUND);
    }
    if (!shop.deletedAt) {
      throw new HttpException("Shop is not deleted", HttpStatus.BAD_REQUEST);
    }
    await this.shopRepo.update(id, { deletedAt: null });
    const restored = await this.shopRepo.findOne({ where: { id } });
    if (!restored) {
      throw new HttpException("Shop not found", HttpStatus.NOT_FOUND);
    }
    return toResponse(restored);
  }
}
