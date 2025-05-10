import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AppDataSource } from "./config/db.config";
import { Logger } from "./shared/services/logger.service";
import { globalSettings } from "./config/settings.config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { HttpExceptionFilter } from "./catch/globalErrorCatcher";
import { RateLimitMiddleware } from "./middleware/ratelimit.middleware";
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // use cookie parser middleware
  // Enable global exception filter
  app.useGlobalFilters(new HttpExceptionFilter(new Logger()));

  app.enableShutdownHooks(); // enable graceful shutdown

  await AppDataSource.initialize();
  console.log("Database connected");

  // check if migrations are pending
  const migrations = await AppDataSource.showMigrations();
  if (migrations) {
    await AppDataSource.runMigrations();
    console.log("Migrations ran successfully");
  }

  app.setGlobalPrefix("api/v1");
  // use swagger for api documentation
  if(globalSettings.WORK_ENVIRONMENT!=="PRODUCTION")
  {
    const config = new DocumentBuilder()
      .setTitle("TASK QUEUE SYSTEM API")
      .setDescription("API DESCRIPTION FOR TASK QUEUE SYSTEM")
      .setVersion("1.0")
      .setBasePath("api/v1")
      .addCookieAuth("token", {
        type: "http",
        in: "cookie",
        description: "JWT Token",
      })
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("swagger", app, document);
  }

  // use morgan for logging
  app.use(new Logger().getMiddleware());

  // set global prefix for api routes and enable CORS
  app.enableCors({ origins: "*" });

  await app.listen(globalSettings.PORT);
  console.log(`Application is running on port ${globalSettings.PORT}`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
