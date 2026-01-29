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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("./entities/shop.entity");
const job_entity_1 = require("./entities/job.entity");
const constants_1 = require("./constants");
function findState(key) {
    return constants_1.CANONICAL_STATES.find((s) => s.key === key);
}
function findFlag(key) {
    return constants_1.FLAGS.find((f) => f.key === key);
}
let PublicController = class PublicController {
    shopRepo;
    jobRepo;
    constructor(shopRepo, jobRepo) {
        this.shopRepo = shopRepo;
        this.jobRepo = jobRepo;
    }
    health() {
        return { ok: true };
    }
    async status(shopKey, token, verify) {
        const shop = await this.shopRepo.findOne({ where: { shopKey } });
        if (!shop) {
            throw new common_1.HttpException("Not found", common_1.HttpStatus.NOT_FOUND);
        }
        const job = await this.jobRepo.findOne({ where: { token, shopId: shop.id } });
        if (!job) {
            throw new common_1.HttpException("Not found", common_1.HttpStatus.NOT_FOUND);
        }
        if (shop.requiresVerification) {
            if (!verify) {
                throw new common_1.HttpException({ message: "verification_required", error: "Verification required" }, common_1.HttpStatus.UNAUTHORIZED);
            }
            const last4 = job.customerPhoneLast4 || this.extractPhoneLast4(job.customerContact);
            if (!last4 || last4 !== verify.trim()) {
                throw new common_1.HttpException({ message: "verification_failed", error: "Invalid verification code" }, common_1.HttpStatus.UNAUTHORIZED);
            }
        }
        const state = findState(job.stateKey);
        const flag = findFlag(job.flagKey);
        return {
            shop,
            job: {
                token: job.token,
                vehicleLabel: job.vehicleLabel,
                stateKey: job.stateKey,
                stateLabel: state?.label || job.stateKey,
                stateCustomerBlurb: state?.customerBlurb || "",
                flagKey: job.flagKey,
                flagLabel: flag?.label || job.flagKey,
                flagCustomerBlurb: flag?.customerBlurb || "",
                updatedAt: job.updatedAt,
                active: job.active,
            },
        };
    }
    extractPhoneLast4(customerContact) {
        const digits = customerContact.replace(/\D/g, '');
        if (digits.length >= 4) {
            return digits.slice(-4);
        }
        return null;
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)("health"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PublicController.prototype, "health", null);
__decorate([
    (0, common_1.Get)(":shopKey/status/:token"),
    __param(0, (0, common_1.Param)("shopKey")),
    __param(1, (0, common_1.Param)("token")),
    __param(2, (0, common_1.Query)("verify")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "status", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)("api/public"),
    __param(0, (0, typeorm_1.InjectRepository)(shop_entity_1.ShopEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(job_entity_1.JobEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], PublicController);
//# sourceMappingURL=public.controller.js.map