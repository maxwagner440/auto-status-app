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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("./entities/shop.entity");
const auth_guard_1 = require("./auth/auth.guard");
let ShopController = class ShopController {
    shopRepo;
    constructor(shopRepo) {
        this.shopRepo = shopRepo;
    }
    async getShopByKey(shopKey) {
        const shop = await this.shopRepo.findOne({ where: { shopKey } });
        if (!shop) {
            throw new common_1.HttpException("Shop not found", common_1.HttpStatus.NOT_FOUND);
        }
        return shop;
    }
    async getShop(shopKey) {
        return this.getShopByKey(shopKey);
    }
    async updateShop(shopKey, body) {
        const shop = await this.getShopByKey(shopKey);
        shop.name = String(body.name ?? shop.name ?? "");
        shop.phone = String(body.phone ?? shop.phone ?? "");
        shop.hours = String(body.hours ?? shop.hours ?? "");
        if (body.primaryContactName !== undefined) {
            shop.primaryContactName = body.primaryContactName === null ? null : String(body.primaryContactName);
        }
        return this.shopRepo.save(shop);
    }
};
exports.ShopController = ShopController;
__decorate([
    (0, common_1.Get)(":shopKey/shop"),
    __param(0, (0, common_1.Param)("shopKey")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "getShop", null);
__decorate([
    (0, common_1.Put)(":shopKey/shop"),
    __param(0, (0, common_1.Param)("shopKey")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShopController.prototype, "updateShop", null);
exports.ShopController = ShopController = __decorate([
    (0, common_1.Controller)("api/admin"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], ShopController);
//# sourceMappingURL=shop.controller.js.map