import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MetaController } from "./meta.controller";
import { ShopController } from "./shop.controller";
import { JobsController } from "./jobs.controller";
import { PublicController } from "./public.controller";
import { AuthModule } from "./auth/auth.module";
import { SuperAdminModule } from "./super-admin/super-admin.module";
import { ShopEntity } from "./entities/shop.entity";
import { JobEntity } from "./entities/job.entity";
import { UserEntity } from "./entities/user.entity";
import * as bcrypt from "bcrypt";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      entities: [ShopEntity, JobEntity, UserEntity],
      // MVP/dev convenience: auto-create tables. For production, use migrations.
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ShopEntity, JobEntity, UserEntity]),
    AuthModule,
    SuperAdminModule,
  ],
  controllers: [MetaController, ShopController, JobsController, PublicController],
})
export class AppModule implements OnModuleInit {
  constructor(
    @InjectRepository(ShopEntity) private readonly shopRepo: Repository<ShopEntity>,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    await this.bootstrapShop();
    await this.bootstrapUser();
  }

  private async bootstrapShop() {
    const shopKey = process.env.DEFAULT_SHOP_KEY;
    const shopPassword = process.env.DEFAULT_SHOP_PASSWORD;

    if (!shopKey || !shopPassword) {
      console.log('DEFAULT_SHOP_KEY and DEFAULT_SHOP_PASSWORD not set - skipping shop bootstrap');
      return;
    }

    const existing = await this.shopRepo.findOne({ where: { shopKey } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(shopPassword, 10);
      const shop = this.shopRepo.create({
        shopKey,
        name: "Your Shop Name",
        phone: "(555) 555-5555",
        hours: "Mon–Fri 8am–5pm",
        primaryContactName: "Service Manager",
        passwordHash,
        requiresVerification: false,
      });
      await this.shopRepo.save(shop);
      console.log(`Bootstrap shop created with key: ${shopKey}`);
    } else {
      console.log(`Bootstrap shop with key ${shopKey} already exists`);
    }
  }

  private async bootstrapUser() {
    const username = process.env.SUPER_ADMIN_BOOTSTRAP_USERNAME;
    const password = process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD;

    if (!username || !password) {
      return;
    }

    const count = await this.userRepo.count();
    if (count > 0) {
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ username: username.trim(), passwordHash });
    await this.userRepo.save(user);
    console.log(`Bootstrap user created: ${username}`);
  }
}
