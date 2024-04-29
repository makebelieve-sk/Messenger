import { Request, Response, Express } from "express";

import { ApiRoutes, ErrorTextsApi, HTTPStatuses } from "../types/enums";
import { IFormValues } from "../types";
import { IUser, IUserDetails } from "../types/models.types";
import Middleware from "../core/Middleware";
import Database from "../core/Database";
import { getSaveUserFields } from "../utils/user";

interface IConstructor {
    app: Express;
    middleware: Middleware;
    database: Database;
};

export default class UserController {
    private _app: Express;
    private _middleware: Middleware;
    private _database: Database;

    constructor({ app, middleware, database }: IConstructor) {
        this._app = app;
        this._middleware = middleware;
        this._database = database;

        this._init();
    }

    // Слушатели запросов контроллера UserController
    private _init() {
        this._app.get(ApiRoutes.getUserDetail, this._middleware.mustAuthenticated.bind(this), this._getUserDetail.bind(this));
        this._app.post(ApiRoutes.editInfo, this._middleware.mustAuthenticated.bind(this), this._editInfo.bind(this));
    }

    // Получение детальной информации о пользователе
    private async _getUserDetail(req: Request, res: Response) {        
        try {
            const userId = (req.user as IUser).id;

            const userDetail = await this._database.models.userDetails.findOne({ where: { userId } });

            if (!userDetail) {
                return res.status(HTTPStatuses.NotFound).send({ success: false, message: ErrorTextsApi.USER_NOT_FOUND_IN_DATABASE });
            }

            return res.json({ success: true, userDetail });
        } catch (error: any) {
            console.log(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    };

    // Изменение информации о пользователе
    private async _editInfo(req: Request, res: Response) {
        const transaction = await this._database.sequelize.transaction();

        try {
            const { name, surName, sex, birthday, work, city, phone, email }: IFormValues = req.body;
            const userId = (req.user as IUser).id;

            const result: { user: Omit<IUser, "password" | "salt"> | null, userDetails: Omit<IUserDetails, "id" | "userId"> | null } = { 
                user: null, 
                userDetails: null 
            };

            const findUser = await this._database.models.users.findByPk(userId, { transaction });

            if (findUser) {
                result.user = {
                    ...getSaveUserFields(findUser),
                    firstName: name, 
                    thirdName: surName, 
                    email, 
                    phone
                };

                await this._database.models.users.update(result.user, { where: { id: userId }, transaction });
            } else {
                await transaction.rollback();
                return res.status(HTTPStatuses.NotFound).send({ 
                    success: false, 
                    message: ErrorTextsApi.USER_NOT_FOUND_IN_DATABASE 
                });
            }

            const findUserDetail = await this._database.models.userDetails.findOne({ where: { userId } });

            if (findUserDetail) {
                result.userDetails = {
                    sex, 
                    birthday, 
                    work,
                    city
                };

                await this._database.models.userDetails.update(result.userDetails, { where: { userId }, transaction });
            } else {
                await transaction.rollback();
                return res.status(HTTPStatuses.NotFound).send({ 
                    success: false, 
                    message: ErrorTextsApi.USER_NOT_FOUND_IN_DATABASE 
                });
            }

            await transaction.commit();

            return res.json({ success: true, ...result });
        } catch (error: any) {
            console.log(error);
            await transaction.rollback();
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    };
};