// Необходимо подключить alias для всего приложения
// eslint-disable-next-line simple-import-sort/imports
import "./service/aliases";
import "@service/env";
import "@service/spawn-backup-process";
import "@service/delete-unused-files";

import express from "express";
import http from "http";

import MainServer from "@core/MainServer";
import { initI18n, t } from "@service/i18n";
import Logger from "@service/logger";
import ProcessWorks from "@service/Process";
import { BaseError } from "@errors/index";
import { NODE_ENV, PORT } from "@utils/constants";

// Добавляем глобальную обработку ошибок (синхронных/асинхронных). При этом, формируем отчеты с детальной информацией об ошибке
const processWork = new ProcessWorks();
const logger = Logger();

// Запуск сервера
async function init() {
	const app = express();
	const server = http.createServer(app);
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
