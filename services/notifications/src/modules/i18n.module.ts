import { HeaderResolver, I18nJsonLoader, I18nModule } from "nestjs-i18n";
import { join } from "path";
import { Global, Module } from "@nestjs/common";

// Глобальный модуль локализации, который будет доступен на всем уровне приложения
@Global()
@Module({
	imports: [
		I18nModule.forRoot({
			fallbackLanguage: "en",
			loader: I18nJsonLoader, // Используем встроенный загрузчик JSON
			loaderOptions: {
				path: join(__dirname, "../", "i18n"), // Путь к папке с переводами
				watch: process.env.NODE_ENV !== "production", // Автообновление только в dev
			},
			resolvers: [
				{
					use: HeaderResolver, // Определяем язык по заголовку запроса
					options: ["lang"], // HTTP-заголовок: lang: ru или en
				},
			],
		}),
	],
	exports: [I18nModule],
})
export default class GlobalI18nModule {}
