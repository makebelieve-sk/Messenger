// Необходимо подключить alias для всего приложения
// eslint-disable-next-line simple-import-sort/imports
import "./service/aliases";
import "@service/env";
import "@service/spawn-backup-process";
import "@service/delete-unused-files";

import express from "express";
import https from "https";
import http from "http";

import MainServer from "@core/MainServer";
import { initI18n, t } from "@service/i18n";
import Logger from "@service/logger";
import ProcessWorks from "@service/Process";
import { BaseError } from "@errors/index";
import { IS_HTTPS, NODE_ENV, PORT } from "@utils/constants";
import fs from "fs";

// Добавляем глобальную обработку ошибок (синхронных/асинхронных). При этом, формируем отчеты с детальной информацией об ошибке
const processWork = new ProcessWorks();
const logger = Logger();

// Запуск сервера
async function init() {
	const app = express();
	/**
	 * Для development режима используем https сервер, для production режима используем http сервер.
	 * Это необходимо, так как продакшен планируется запускать через nginx на платформе PaaS (Heroku/Vercel/Render/etc).
	 * Именно nginx будет принимать запросы по порту 443 и перенаправлять их на внутренний порт 5000 по протоколу http.
	 * 
	 * Для production режима мы могли бы тоже использовать обычный http сервер, но необходимо было научится правильно настраивать
	 * https соединение для приложения как на сервере, так и на клиенте.
	 * 
	 * При этом, важно понять, что в докере у нас есть два варианта запуска приложения, которые управляются новой переменной MESSANGER_ENV:
	 * 1) stage - запуск приложения через https. Такой же запуск, как локальный (npm run start).
	 * 2) production - запуск приложения через docker compose (http) для production режима.
	 * 
	 * Также, переменная MESSANGER_ENV устанавливается равной development, если запускается локально (npm run start).
	 */
	const server = IS_HTTPS
		? https.createServer({
			key: fs.readFileSync("./certs/localhost-key.pem"),
			cert: fs.readFileSync("./certs/localhost.pem"),
		}, app)
		: http.createServer(app);
	const mainServer = new MainServer(app, server);

	processWork.setServer(mainServer);

	try {
		server.listen(PORT, () => logger.info(t("server_started", { mode: NODE_ENV, port: PORT })));
	} catch (error) {
		new BaseError(`${t("start_server_error")}: ${error}`);
		await processWork.stopServerWithError();
	}
}

// Инициализируем интернационализацию на сервере и после запускаем сам сервер
initI18n(init);
