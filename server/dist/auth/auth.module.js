"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./jwt.strategy");
const jwt_super_admin_strategy_1 = require("./jwt-super-admin.strategy");
const auth_guard_1 = require("./auth.guard");
const super_admin_guard_1 = require("./super-admin.guard");
const super_admin_auth_controller_1 = require("./super-admin-auth.controller");
const shop_entity_1 = require("../entities/shop.entity");
const user_entity_1 = require("../entities/user.entity");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            typeorm_1.TypeOrmModule.forFeature([shop_entity_1.ShopEntity, user_entity_1.UserEntity]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET') || 'your-secret-key-change-in-production',
                    signOptions: { expiresIn: '24h' },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController, super_admin_auth_controller_1.SuperAdminAuthController],
        providers: [jwt_strategy_1.JwtStrategy, jwt_super_admin_strategy_1.JwtSuperAdminStrategy, auth_guard_1.AuthGuard, super_admin_guard_1.SuperAdminGuard],
        exports: [auth_guard_1.AuthGuard, super_admin_guard_1.SuperAdminGuard, jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map