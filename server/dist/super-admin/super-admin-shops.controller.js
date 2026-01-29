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
exports.SuperAdminShopsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const shop_entity_1 = require("../entities/shop.entity");
const super_admin_guard_1 = require("../auth/super-admin.guard");
function toResponse(shop) {
    const { passwordHash: _h, ...rest } = shop;
    return { ...rest, deletedAt: shop.deletedAt ?? null };
}
function generateShopKey() {
    return crypto.randomBytes(8).toString("base64url");
}
let SuperAdminShopsController = class SuperAdminShopsController {
    shopRepo;
    constructor(shopRepo) {
        this.shopRepo = shopRepo;
    }
    async list() {
        const shops = await this.shopRepo.find({
            withDeleted: true,
            order: { createdAt: "DESC" },
        });
        return shops.map(toResponse);
    }
    async get(id) {
        const shop = await this.shopRepo.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!shop) {
            throw new common_1.HttpException("Shop not found", common_1.HttpStatus.NOT_FOUND);
        }
        return toResponse(shop);
    }
    async create(body) {
        const name = body?.name != null ? String(body.name).trim() : "";
        const phone = body?.phone != null ? String(body.phone).trim() : "";
        const hours = body?.hours != null ? String(body.hours).trim() : "";
        const password = body?.password != null ? String(body.password) : "";
        if (!name || !phone || !hours || !password) {
            throw new common_1.HttpException("name, phone, hours, and password are required", common_1.HttpStatus.BAD_REQUEST);
        }
        let shopKey;
        if (body.shopKey != null && String(body.shopKey).trim()) {
            shopKey = String(body.shopKey).trim();
            if (!/^[a-z0-9_-]+$/i.test(shopKey)) {
                throw new common_1.HttpException("shopKey must be alphanumeric, hyphens, or underscores only", common_1.HttpStatus.BAD_REQUEST);
            }
            const existing = await this.shopRepo.findOne({
                where: { shopKey },
                withDeleted: true,
            });
            if (existing) {
                throw new common_1.HttpException("A shop with this shopKey already exists", common_1.HttpStatus.CONFLICT);
            }
        }
        else {
            let generated = null;
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
                throw new common_1.HttpException("Could not generate unique shopKey; please provide one", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            shopKey = generated;
        }
        const primaryContactName = body.primaryContactName === null || body.primaryContactName === undefined
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
    async update(id, body) {
        const shop = await this.shopRepo.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!shop) {
            throw new common_1.HttpException("Shop not found", common_1.HttpStatus.NOT_FOUND);
        }
        if (shop.deletedAt) {
            throw new common_1.HttpException("Cannot update a soft-deleted shop; restore it first", common_1.HttpStatus.BAD_REQUEST);
        }
        if (body.name !== undefined) {
            const v = String(body.name ?? "").trim();
            if (!v)
                throw new common_1.HttpException("name cannot be empty", common_1.HttpStatus.BAD_REQUEST);
            shop.name = v;
        }
        if (body.phone !== undefined) {
            const v = String(body.phone ?? "").trim();
            if (!v)
                throw new common_1.HttpException("phone cannot be empty", common_1.HttpStatus.BAD_REQUEST);
            shop.phone = v;
        }
        if (body.hours !== undefined) {
            const v = String(body.hours ?? "").trim();
            if (!v)
                throw new common_1.HttpException("hours cannot be empty", common_1.HttpStatus.BAD_REQUEST);
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
    async softDelete(id) {
        const shop = await this.shopRepo.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!shop) {
            throw new common_1.HttpException("Shop not found", common_1.HttpStatus.NOT_FOUND);
        }
        if (shop.deletedAt) {
            throw new common_1.HttpException("Shop is already soft-deleted", common_1.HttpStatus.BAD_REQUEST);
        }
        await this.shopRepo.softRemove(shop);
        return { deleted: true };
    }
    async restore(id) {
        const shop = await this.shopRepo.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!shop) {
            throw new common_1.HttpException("Shop not found", common_1.HttpStatus.NOT_FOUND);
        }
        if (!shop.deletedAt) {
            throw new common_1.HttpException("Shop is not deleted", common_1.HttpStatus.BAD_REQUEST);
        }
        await this.shopRepo.update(id, { deletedAt: null });
        const restored = await this.shopRepo.findOne({ where: { id } });
        if (!restored) {
            throw new common_1.HttpException("Shop not found", common_1.HttpStatus.NOT_FOUND);
        }
        return toResponse(restored);
    }
};
exports.SuperAdminShopsController = SuperAdminShopsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminShopsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminShopsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminShopsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminShopsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminShopsController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Post)(":id/restore"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuperAdminShopsController.prototype, "restore", null);
exports.SuperAdminShopsController = SuperAdminShopsController = __decorate([
    (0, common_1.Controller)("api/super-admin/shops"),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    __param(0, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], SuperAdminShopsController);
//# sourceMappingURL=super-admin-shops.controller.js.map