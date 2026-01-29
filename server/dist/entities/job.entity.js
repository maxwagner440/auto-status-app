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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobEntity = void 0;
const typeorm_1 = require("typeorm");
const shop_entity_1 = require("./shop.entity");
let JobEntity = class JobEntity {
    id;
    token;
    customerContact;
    customerPhoneLast4;
    vehicleLabel;
    stateKey;
    flagKey;
    active;
    shopId;
    shop;
    createdAt;
    updatedAt;
};
exports.JobEntity = JobEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], JobEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], JobEntity.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], JobEntity.prototype, "customerContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", Object)
], JobEntity.prototype, "customerPhoneLast4", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], JobEntity.prototype, "vehicleLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], JobEntity.prototype, "stateKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], JobEntity.prototype, "flagKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], JobEntity.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "uuid" }),
    __metadata("design:type", String)
], JobEntity.prototype, "shopId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.ShopEntity),
    (0, typeorm_1.JoinColumn)({ name: "shopId" }),
    __metadata("design:type", shop_entity_1.ShopEntity)
], JobEntity.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: "timestamptz" }),
    __metadata("design:type", Date)
], JobEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: "timestamptz" }),
    __metadata("design:type", Date)
], JobEntity.prototype, "updatedAt", void 0);
exports.JobEntity = JobEntity = __decorate([
    (0, typeorm_1.Entity)({ name: "jobs" })
], JobEntity);
//# sourceMappingURL=job.entity.js.map