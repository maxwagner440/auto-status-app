"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const typeorm_3 = require("typeorm");
const meta_controller_1 = require("./meta.controller");
const shop_controller_1 = require("./shop.controller");
const jobs_controller_1 = require("./jobs.controller");
const public_controller_1 = require("./public.controller");
const auth_module_1 = require("./auth/auth.module");
const super_admin_module_1 = require("./super-admin/super-admin.module");
const shop_entity_1 = require("./entities/shop.entity");
const job_entity_1 = require("./entities/job.entity");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = require("bcrypt");
let AppModule = class AppModule {
    shopRepo;
    userRepo;
    constructor(shopRepo, userRepo) {
        this.shopRepo = shopRepo;
        this.userRepo = userRepo;
    }
    async onModuleInit() {
        await this.bootstrapShop();
        await this.bootstrapUser();
    }
    async bootstrapShop() {
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
        }
        else {
            console.log(`Bootstrap shop with key ${shopKey} already exists`);
        }
    }
    async bootstrapUser() {
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
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: "postgres",
                url: process.env.DATABASE_URL,
                entities: [shop_entity_1.ShopEntity, job_entity_1.JobEntity, user_entity_1.UserEntity],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([shop_entity_1.ShopEntity, job_entity_1.JobEntity, user_entity_1.UserEntity]),
            auth_module_1.AuthModule,
            super_admin_module_1.SuperAdminModule,
        ],
        controllers: [meta_controller_1.MetaController, shop_controller_1.ShopController, jobs_controller_1.JobsController, public_controller_1.PublicController],
    }),
    __param(0, (0, typeorm_2.InjectRepository)(shop_entity_1.ShopEntity)),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_3.Repository !== "undefined" && typeorm_3.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_3.Repository !== "undefined" && typeorm_3.Repository) === "function" ? _b : Object])
], AppModule);
//# sourceMappingURL=app.module.js.map