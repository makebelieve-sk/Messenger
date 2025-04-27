import type { Express, NextFunction, Request, Response } from "express";

import Logger from "@service/logger";
import { ApiRoutes, HTTPStatuses } from "@custom-types/enums";

const logger = Logger("MainController");

// Класс, отвечающий за основное/внешнее API
export default class MainController {
	constructor(private readonly _app: Express) {
		this._init();
	}

	// Слушатели запросов контроллера MainController
	private _init() {
		this._app.get(ApiRoutes.checkHealth, this._checkHealth);
	}

	/**
     * Проверка "здоровья" сервера.
     * Используется в основном для получения информации о том, что сервер запущен и работает без критичных ошибок.
     */
	private async _checkHealth(_: Request, res: Response, next: NextFunction) {
		try {
			logger.debug("_checkHealth success");

			res.status(HTTPStatuses.NoContent).end();
		} catch (error) {
			next(error);
		}
	}
}
