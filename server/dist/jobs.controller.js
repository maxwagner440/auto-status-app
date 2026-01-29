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
exports.JobsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = require("crypto");
const job_entity_1 = require("./entities/job.entity");
const shop_entity_1 = require("./entities/shop.entity");
const auth_guard_1 = require("./auth/auth.guard");
const constants_1 = require("./constants");
function randomToken() {
    return crypto.randomBytes(9).toString("base64url");
}
function isValidState(key) {
    return constants_1.CANONICAL_STATES.some((s) => s.key === key);
}
function isValidFlag(key) {
    return constants_1.FLAGS.some((f) => f.key === key);
}
function extractPhoneLast4(customerContact) {
    const digits = customerContact.replace(/\D/g, '');
    if (digits.length >= 4) {
        return digits.slice(-4);
    }
    return null;
}
let JobsController = class JobsController {
    jobRepo;
    shopRepo;
    constructor(jobRepo, shopRepo) {
        this.jobRepo = jobRepo;
        this.shopRepo = shopRepo;
    }
    extractPhoneLast4 = extractPhoneLast4;
    async getShopByKey(shopKey) {
        const shop = await this.shopRepo.findOne({ where: { shopKey } });
        if (!shop) {
            throw new common_1.HttpException("Shop not found", common_1.HttpStatus.NOT_FOUND);
        }
        return shop;
    }
    async list(shopKey) {
        const shop = await this.getShopByKey(shopKey);
        return this.jobRepo.find({
            where: { shopId: shop.id },
            order: { updatedAt: "DESC" }
        });
    }
    async create(shopKey, body) {
        if (!body?.customerContact || !body?.vehicleLabel) {
            throw new common_1.HttpException("customerContact and vehicleLabel are required", common_1.HttpStatus.BAD_REQUEST);
        }
        const shop = await this.getShopByKey(shopKey);
        const customerContact = String(body.customerContact);
        const customerPhoneLast4 = this.extractPhoneLast4(customerContact);
        const job = this.jobRepo.create({
            token: randomToken(),
            customerContact,
            customerPhoneLast4,
            vehicleLabel: String(body.vehicleLabel),
            stateKey: "CHECKED_IN",
            flagKey: "NONE",
            active: true,
            shopId: shop.id,
        });
        return this.jobRepo.save(job);
    }
    async get(shopKey, id) {
        const shop = await this.getShopByKey(shopKey);
        const job = await this.jobRepo.findOne({ where: { id, shopId: shop.id } });
        if (!job)
            throw new common_1.HttpException("Not found", common_1.HttpStatus.NOT_FOUND);
        return job;
    }
    async update(shopKey, id, body) {
        const shop = await this.getShopByKey(shopKey);
        const job = await this.jobRepo.findOne({ where: { id, shopId: shop.id } });
        if (!job)
            throw new common_1.HttpException("Not found", common_1.HttpStatus.NOT_FOUND);
        if (!job.active && body.active !== true && (body.stateKey || body.flagKey)) {
            throw new common_1.HttpException("Cannot update an inactive job. Reactivate it first.", common_1.HttpStatus.BAD_REQUEST);
        }
        if (body.stateKey && !isValidState(body.stateKey))
            throw new common_1.HttpException("Invalid stateKey", common_1.HttpStatus.BAD_REQUEST);
        if (body.flagKey && !isValidFlag(body.flagKey))
            throw new common_1.HttpException("Invalid flagKey", common_1.HttpStatus.BAD_REQUEST);
        if (body.stateKey)
            job.stateKey = body.stateKey;
        if (body.flagKey)
            job.flagKey = body.flagKey;
        if (body.active !== undefined)
            job.active = body.active;
        return this.jobRepo.save(job);
    }
};
exports.JobsController = JobsController;
__decorate([
    (0, common_1.Get)(":shopKey/jobs"),
    __param(0, (0, common_1.Param)("shopKey")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(":shopKey/jobs"),
    __param(0, (0, common_1.Param)("shopKey")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(":shopKey/jobs/:id"),
    __param(0, (0, common_1.Param)("shopKey")),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(":shopKey/jobs/:id"),
    __param(0, (0, common_1.Param)("shopKey")),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "update", null);
exports.JobsController = JobsController = __decorate([
    (0, common_1.Controller)("api/admin"),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.JobEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], JobsController);
//# sourceMappingURL=jobs.controller.js.map