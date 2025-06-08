import { NestFactory } from "@nestjs/core";

import { AppModule } from "./modules/app.module";

// Иницализация сервера
async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	console.log("port:", process.env.PORT || 8009)
	await app.listen(process.env.PORT || 8009);
}

bootstrap();