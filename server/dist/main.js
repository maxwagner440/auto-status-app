"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: false });
    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:4200";
    app.enableCors({ origin: clientOrigin });
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    await app.listen(port);
    console.log(`API listening on http://localhost:${port} (CORS: ${clientOrigin})`);
}
bootstrap();
//# sourceMappingURL=main.js.map