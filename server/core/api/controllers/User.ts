import { ApiRoutes, HTTPErrorTypes, HTTPStatuses } from "common-types";
import type { Express, NextFunction, Request, Response } from "express";

import Middleware from "@core/api/Middleware";
import Database from "@core/database/Database";
import { t } from "@service/i18n";
import Logger from "@service/logger";
import { UsersError } from "@errors/controllers";
import { validateEmail, validatePhoneNumber } from "@utils/auth";

const logger = Logger("UserController");

const NOT_REQUIRED_EDIT_INFO_FIELDS = [ "sex", "birthday", "work", "city" ];

interface IEditInfoBody {
	name: string;
	surName: string;
	sex: string;
	birthday: string;
	work: string;
	city: string;
	phone: string;
	email: string;
};

// Класс, отвечающий за API пользователей
export default class UserController {
	constructor(
		private readonly _app: Express,
		private readonly _middleware: Middleware,
		private readonly _database: Database,
	) {
		this._init();
	}

	// Слушатели запросов контроллера UserController
	private _init() {
		this._app.get(ApiRoutes.getMe, this._middleware.mustAuthenticated.bind(this._middleware), this._getMe.bind(this));
		this._app.post(ApiRoutes.getUser, this._middleware.mustAuthenticated.bind(this._middleware), this._getUser.bind(this));
		this._app.put(ApiRoutes.editInfo, this._middleware.mustAuthenticated.bind(this._middleware), this._editInfo.bind(this));
	}

	// Получение данных о себе
	private async _getMe(req: Request, res: Response, next: NextFunction) {
		logger.debug("_getMe");

		const transaction = await this._database.sequelize.transaction();

		try {
			if (!req.user) {
				throw new UsersError(t("users.error.user_not_found"), HTTPStatuses.NotFound);
			}

			const user = req.user;

			// Получение дополнительной информации и общих звуковых настроек пользователя
			const { userDetails, notificationSettings } = await this._database.repo.populateUser({ userId: user.id, transaction });

			await transaction.commit();

			res.json({
				success: true,
				user,
				userDetails: userDetails.getEntity(),
				notificationSettings: notificationSettings.getEntity(),
			});
		} catch (error) {
			await transaction.rollback();
			next(error);
		}
	}

	// Получение данных о другом пользователе (при загрузке другого профиля)
	private async _getUser(req: Request, res: Response, next: NextFunction) {
		logger.debug("_getUser [req.body=%j]", req.body);

		const transaction = await this._database.sequelize.transaction();

		try {
			const { id }: { id: string; } = req.body;

			if (!id) {
				throw new UsersError(t("users.error.user_id_not_found"), HTTPStatuses.BadRequest);
			}

			const foundUser = await this._database.repo.users.getById({ userId: id, transaction });

			if (!foundUser) {
				throw new UsersError(t("users.error.user_with_id_not_found", { id }), HTTPStatuses.NotFound);
			}

			// Получаем объект пользователя с аватаром и безопасными полями
			const user = await this._database.repo.users.getUserWithAvatar({
				user: foundUser,
			});

			const userDetails = await this._database.repo.userDetails.getById({ userId: id, transaction });

			if (!userDetails) {
				throw new UsersError(t("users.error.user_with_id_not_found", { id }), HTTPStatuses.NotFound);
			}

			await transaction.commit();

			res.json({ success: true, user, userDetails: userDetails.getEntity() });
		} catch (error) {
			await transaction.rollback();
			next(error);
		}
	}

	// Изменение информации о пользователе
	private async _editInfo(req: Request, res: Response, next: NextFunction) {
		logger.debug("_editInfo [req.body=%j]", req.body);

		const transaction = await this._database.sequelize.transaction();

		try {
			const fields: IEditInfoBody = req.body;
			const { id: userId } = req.user;
			// Формируем те поля из объекта req.body, которые остались пусты
			const missingFields = Object.entries(fields)
				.filter(([ key, value ]) => !value && !NOT_REQUIRED_EDIT_INFO_FIELDS.includes(key))
				.map(([ key ]) => key);

			// Проверка обязательных полей пользователя
			if (missingFields.length) {
				throw new UsersError(
					t("users.error.edit_incorrect_data", { fields: missingFields.join(", ") }),
					HTTPStatuses.BadRequest,
					{
						type: HTTPErrorTypes.EDIT_INFO,
						fields: missingFields,
					},
				);
			}

			const { name, surName, sex, birthday, work, city, phone, email } = fields;
			// Валидация введенной почты
			const validationEmail = validateEmail(email);

			if (!validationEmail) {
				throw new UsersError(
					t("users.error.edit_incorrect_format", { fields: "email" }),
					HTTPStatuses.BadRequest,
					{
						type: HTTPErrorTypes.EDIT_INFO,
						field: "email",
					},
				);
			}

			// Валидация введенного номера телефона
			const validationPhone = validatePhoneNumber(phone);

			if (!validationPhone) {
				throw new UsersError(
					t("users.error.edit_incorrect_format", { fields: "phone" }),
					HTTPStatuses.BadRequest,
					{
						type: HTTPErrorTypes.EDIT_INFO,
						field: "phone",
					},
				);
			}

			const foundUser = await this._database.repo.users.getById({
				userId,
				transaction,
			});

			if (!foundUser) {
				throw new UsersError(t("users.error.user_with_id_not_found", { id: userId }), HTTPStatuses.NotFound);
			}

			// Обновляем поля пользователя
			Object.assign(foundUser, {
				email: validationEmail,
				phone: validationPhone,
				firstName: name,
				thirdName: surName,
			});

			await foundUser.save({ transaction });

			const foundUserDetails = await this._database.repo.userDetails.findOneBy({
				filters: { userId },
				transaction,
			});

			if (!foundUserDetails) {
				throw new UsersError(t("users.error.user_details_not_found"), HTTPStatuses.NotFound);
			}

			// Обновляем поля доп. информации о пользователе
			Object.assign(foundUserDetails, {
				sex: sex === "" ? null : sex,
				birthday,
				work,
				city,
			});

			await foundUserDetails.save({ transaction });

			await transaction.commit();

			res.json({
				success: true,
				user: foundUser.getEntity(),
				userDetails: foundUserDetails.getEntity(),
			});
		} catch (error) {
			next(error);
		}
	}
}
