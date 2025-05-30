import { ApiRoutes, HTTPStatuses } from "common-types";
import type { Express, NextFunction, Request, Response } from "express";

import swaggerConfig from "@config/swagger/swaggerConfig";
import AuthController from "@core/api/controllers/Auth";
import type Middleware from "@core/api/Middleware";
import swaggerWork from "@core/api/swagger/Swagger";
import { generateMermaidDiagram } from "@core/api/swagger/SwaggerDiagramGenerator";
import type Database from "@core/database/Database";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { MainError } from "@errors/controllers";
import { COOKIE_NAME } from "@utils/constants";


const logger = Logger("MainController");

// Класс, отвечающий за основное/внешнее API
export default class MainController {
	constructor(
		private readonly _app: Express,
		private readonly _middleware: Middleware,
		private readonly _database: Database,
		private readonly _swagger: swaggerWork,
	) {
		this._init();
	}

	// Слушатели запросов контроллера MainController
	private _init() {

		this._app.get(ApiRoutes.checkHealth, this._checkHealth);
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

		this._app.get("/api-docs/diagram", (_, res) => {
			const endpoints = Object.entries(swaggerConfig.paths)
				.map(([ path, methods ]) => {
					const ops = Object.keys(methods).map(
						(method) => `<li><a href="#" onclick="renderDiagram('${method}', '${path}')">${method.toUpperCase()} ${path}</a></li>`,
					).join("\n");
					return ops;
				}).join("\n");

			const html = `
  <!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <title>Все эндпоинты</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
      mermaid.initialize({ startOnLoad: false });

      async function renderDiagram(method, path) {
        const response = await fetch(\`/api-docs/diagram-api?path=\${encodeURIComponent(path)}&method=\${method}\`);
        const { diagram } = await response.json();
        document.getElementById("diagram").innerHTML = diagram;
        mermaid.init(undefined, "#diagram");
      }
    </script>
    <style>
      body { font-family: sans-serif; padding: 2em; }
      ul { list-style: none; padding: 0; }
      li { margin-bottom: 0.5em; }
    </style>
  </head>
  <body>
    <h1>Список всех endpoint’ов</h1>
    <ul>
      ${endpoints}
    </ul>
    <div id="diagram" class="mermaid"></div>
  </body>
  </html>
  `;

			res.send(html);
		});


		this._app.get("/api-docs/diagram-api", (req, res) => {
			const { path, method } = req.query;

			if (typeof path === "string" && method && typeof method === "string") {
				const diagram = generateMermaidDiagram(path, method.toLowerCase());
				res.json({ diagram });
			} else {
				res.status(400).json({ error: "Invalid path parameter" });
			}
		});

		this._app.use(ApiRoutes.apiDocs, this._swagger.serve, this._swagger.setup);
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
