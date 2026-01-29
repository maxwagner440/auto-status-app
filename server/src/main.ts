import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:4200";
  app.enableCors({ origin: clientOrigin });

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  console.log(`API listening on http://localhost:${port} (CORS: ${clientOrigin})`);
}
bootstrap();
