import EventEmitter from "events";
import { Request, Response, Express } from "express";
import { Transaction } from "sequelize";

import { ApiRoutes, HTTPStatuses } from "../types/enums";
import { ApiServerEvents } from "../types/events";
import { IFormValues } from "../types";
import { IUser, IUserDetails } from "../types/models.types";
import Middleware from "../core/Middleware";
import Database from "../core/Database";
import { getSaveUserFields } from "../utils/user";
import { UsersError } from "../errors/controllers";
import { ISaveUser } from "../database/models/Users";
import { t } from "../service/i18n";

interface IConstructor {
    app: Express;
    middleware: Middleware;
    database: Database;
};

export default class UserController extends EventEmitter {
    private readonly _app: Express;
    private readonly _middleware: Middleware;
    private readonly _database: Database;

    constructor({ app, middleware, database }: IConstructor) {
        super();

        this._app = app;
        this._middleware = middleware;
        this._database = database;

        this._init();
    }

    // Слушатели запросов контроллера UserController
    private _init() {
        this._app.get(ApiRoutes.getMe, this._middleware.mustAuthenticated.bind(this._middleware), this._getMe.bind(this));
        this._app.get(ApiRoutes.getUserDetail, this._middleware.mustAuthenticated.bind(this._middleware), this._getUserDetail.bind(this));
        this._app.post(ApiRoutes.editInfo, this._middleware.mustAuthenticated.bind(this._middleware), this._editInfo.bind(this));
        this._app.post(ApiRoutes.getUser, this._middleware.mustAuthenticated.bind(this._middleware), this._getUser.bind(this));
    }

    // Обработка ошибки
    private async _handleError(error: unknown, res: Response, transaction?: Transaction) {
        if (transaction) await transaction.rollback();

        this.emit(ApiServerEvents.ERROR, { error, res });
    }

    // Получение данных о себе
    private async _getMe(req: Request, res: Response) {
        try {
            if (!req.user) {
                throw new UsersError(t("users.error.user_not_found"), HTTPStatuses.NotFound);
            }

            return res.json({ success: true, user: req.user });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Получение детальной информации о пользователе
    private async _getUserDetail(req: Request, res: Response) {        
        try {
            const userId = (req.user as IUser).id;

            const userDetail = await this._database.models.userDetails.findOne({ where: { userId } });

            if (!userDetail) {
                throw new UsersError(t("users.error.user_details_not_found"), HTTPStatuses.NotFound);
            }

            return res.json({ success: true, userDetail });
        } catch (error) {
            this._handleError(error, res);
        }
    };

    // Изменение информации о пользователе
    private async _editInfo(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { name, surName, sex, birthday, work, city, phone, email }: IFormValues = req.body;
            const userId = (req.user as IUser).id;

            const result: { user: ISaveUser | null, userDetails: Omit<IUserDetails, "id" | "userId"> | null } = { 
                user: null, 
                userDetails: null 
            };

            const findUser = await this._database.models.users.findByPk(userId, { transaction });

            if (!findUser) {
                throw new UsersError(t("users.error.user_with_id_not_found", { id: userId }), HTTPStatuses.NotFound);
            } 

            result.user = {
                ...getSaveUserFields(findUser),
                firstName: name, 
                thirdName: surName, 
                email, 
                phone
            };

            await this._database.models.users.update(result.user, { where: { id: userId }, transaction });

            const findUserDetail = await this._database.models.userDetails.findOne({ where: { userId } });

            if (!findUserDetail) {
                throw new UsersError(t("users.error.user_details_not_found"), HTTPStatuses.NotFound);
            }

            result.userDetails = {
                sex, 
                birthday, 
                work,
                city
            };

            await this._database.models.userDetails.update(result.userDetails, { where: { userId }, transaction });

            await transaction.commit();

            return res.json({ success: true, ...result });
        } catch (error) {
            await this._handleError(error, res, transaction);
        }
    };

    // Получение данных о другом пользователе
    private async _getUser(req: Request, res: Response) {
        try {
            const { id }: { id: string; } = req.body;

            if (!id) {
                throw new UsersError(t("users.error.user_id_not_found"), HTTPStatuses.BadRequest);
            }

            const findUser = await this._database.models.users.findByPk(id);

            if (!findUser) {
                throw new UsersError(t("users.error.user_with_id_not_found", { id }), HTTPStatuses.NotFound);
            }

            return res.json({ success: true, user: getSaveUserFields(findUser) });
        } catch (error) {
            this._handleError(error, res);
        }
    };
};