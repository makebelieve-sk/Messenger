import { ApiRoutes, HTTPStatuses } from "common-types";
import type { Express, NextFunction, Request, Response } from "express";

import AuthController from "@core/api/controllers/Auth";
import type Middleware from "@core/api/Middleware";
import type swaggerWork from "@core/api/swagger/Swagger";
import SwaggerWork from "@core/api/swagger/Swagger";
import type Database from "@core/database/Database";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { MainError } from "@errors/controllers";
import { COOKIE_NAME } from "@utils/constants";


const logger = Logger("MainController");

// Класс, отвечающий за основное/внешнее API
export default class MainController {
	private readonly _swagger: swaggerWork;
	constructor(
		private readonly _app: Express,
		private readonly _middleware: Middleware,
		private readonly _database: Database,
	) {
		this._swagger = new SwaggerWork();
		this._init();
	}

	// Слушатели запросов контроллера MainController
	private _init() {

		this._app.get(ApiRoutes.checkHealth, this._checkHealth);


		this._app.get(ApiRoutes.diagram, this._middleware.mustAuthenticated.bind(this._middleware), async (_, res, next) => {
			try {
				const html = await this._swagger.generateDiagramPage();
				res.removeHeader("Content-Security-Policy");
				res.send(html);
			} catch (error) {
				next(error);
			}
		});


		this._app.get(ApiRoutes.diagram_api, this._middleware.mustAuthenticated.bind(this._middleware), (req, res, next) => {
			try {
				const { path, method } = req.query;

				if (typeof path !== "string" || typeof method !== "string") {
					throw new MainError(
						t("mermaid.error.invalid_path_or_method"),
						HTTPStatuses.BadRequest,
					);
				}
				const diagram = this._swagger.generateMermaidDiagram(path, method.toLowerCase());
				res.json({ diagram });
			} catch (error) {
				next(error);
			}
		});

		this._app.use(ApiRoutes.apiDocs, this._middleware.mustAuthenticated.bind(this._middleware), this._swagger.serve, this._swagger.setup);

		this._app.get(
			ApiRoutes.deleteAccount,
			this._middleware.mustAuthenticated.bind(this._middleware),
			this._deleteAccount.bind(this),
		);
		this._app.put(
			ApiRoutes.soundNotifications,
			this._middleware.mustAuthenticated.bind(this._middleware),
			this._soundNotifications.bind(this),
		);
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

	// Удаление аккаунта пользователя
	private async _deleteAccount(req: Request, res: Response, next: NextFunction) {
		const transaction = await this._database.sequelize.transaction();

		try {
			const { id: userId } = req.user;

			logger.debug("_deleteAccount [userId=%s]", userId);

			// Сначала необходимо удалить текущую сессию и выйти со всех вкладок и браузеров
			const socketNotification = await AuthController.logout(req);

			// Удаляем все записи об учетной записи пользователя
			await this._database.repo.deleteUser({ userId, transaction });

			// Уведомляем собственные подключения о выходе после выполнения всех удалений в базе данных
			await socketNotification();

			await transaction.commit();

			res.status(HTTPStatuses.NoContent).clearCookie(COOKIE_NAME).end();
		} catch (error) {
			await transaction.rollback();
			next(error);
		}
	}

	// Обновление звуковых уведомлений пользователя
	private async _soundNotifications(req: Request, res: Response, next: NextFunction) {
		const transaction = await this._database.sequelize.transaction();

		try {
			logger.debug("_soundNotifications");

			const { userId, soundEnabled, messageSound, friendRequestSound } = req.body;

			const notificationsSound = await this._database.repo.notificationsSettings.findOneBy({
				filters: { userId },
				transaction,
			});

			if (!notificationsSound) {
				throw new MainError(t("main.error.users_notifications_not_found"));
			}

			notificationsSound.soundEnabled = soundEnabled;
			notificationsSound.messageSound = messageSound;
			notificationsSound.friendRequestSound = friendRequestSound;

			await notificationsSound.save({ transaction });

			await transaction.commit();

			res.json({ success: true });
		} catch (error) {
			await transaction.rollback();
			next(error);
		}
	}
}
