import { Request, Response, Express, NextFunction } from "express";

import Logger from "../service/logger";
import { t } from "../service/i18n";
import { ApiRoutes, HTTPStatuses } from "../types/enums";
import { IUserDetails } from "../types/models.types";
import { ISafeUser } from "../types/user.types";
import Middleware from "../core/Middleware";
import Database from "../core/Database";
import { getSafeUserFields } from "../utils/user";
import { UsersError } from "../errors/controllers";

const logger = Logger("UserController");

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
    constructor(private readonly _app: Express, private readonly _middleware: Middleware, private readonly _database: Database) {
        this._init();
    }

    // Слушатели запросов контроллера UserController
    private _init() {
        this._app.get(ApiRoutes.getMe, this._middleware.mustAuthenticated.bind(this._middleware), this._getMe);
        this._app.get(ApiRoutes.getUserDetail, this._middleware.mustAuthenticated.bind(this._middleware), this._getUserDetail.bind(this));
        this._app.post(ApiRoutes.editInfo, this._middleware.mustAuthenticated.bind(this._middleware), this._editInfo.bind(this));
        this._app.post(ApiRoutes.getUser, this._middleware.mustAuthenticated.bind(this._middleware), this._getUser.bind(this));
    }

    // Получение данных о себе
    private _getMe(req: Request, res: Response, next: NextFunction) {
        logger.debug("_getMe");

        if (!req.user) {
            return next(new UsersError(t("users.error.user_not_found"), HTTPStatuses.NotFound));
        }

        res.json({ success: true, user: req.user });
    };

    // Получение детальной информации о пользователе
    private async _getUserDetail(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as ISafeUser).id;

            logger.debug("_getUserDetail [userId=%s]", userId);

            const userDetail = await this._database.models.userDetails.findOne({ where: { userId } });

            if (!userDetail) {
                return next(new UsersError(t("users.error.user_details_not_found"), HTTPStatuses.NotFound));
            }

            res.json({ success: true, userDetail });
        } catch (error) {
            next(error);
        }
    };

    // Изменение информации о пользователе
    private async _editInfo(req: Request, res: Response, next: NextFunction) {
        logger.debug("_editInfo [req.body=%s]", req.body);

        const transaction = await this._database.sequelize.transaction();

        try {
            const { name, surName, sex, birthday, work, city, phone, email }: IEditInfoBody = req.body;
            const userId = (req.user as ISafeUser).id;

            const result: { user: ISafeUser | null, userDetails: Omit<IUserDetails, "id" | "userId"> | null } = { 
                user: null, 
                userDetails: null 
            };

            const findUser = await this._database.models.users.findByPk(userId, { transaction });

            if (!findUser) {
                await transaction.rollback();
                return next(new UsersError(t("users.error.user_with_id_not_found", { id: userId }), HTTPStatuses.NotFound));
            } 

            result.user = {
                ...getSafeUserFields(findUser),
                firstName: name, 
                thirdName: surName, 
                email, 
                phone
            };

            await this._database.models.users.update(result.user, { where: { id: userId }, transaction });

            const findUserDetail = await this._database.models.userDetails.findOne({ where: { userId } });

            if (!findUserDetail) {
                await transaction.rollback();
                return next(new UsersError(t("users.error.user_details_not_found"), HTTPStatuses.NotFound));
            }

            result.userDetails = {
                sex, 
                birthday, 
                work,
                city
            };

            await this._database.models.userDetails.update(result.userDetails, { where: { userId }, transaction });

            await transaction.commit();

            res.json({ success: true, ...result });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    };

    // Получение данных о другом пользователе
    private async _getUser(req: Request, res: Response, next: NextFunction) {
        logger.debug("_getUser [req.body=%s]", req.body);

        try {
            const { id }: { id: string; } = req.body;

            if (!id) {
                return next(new UsersError(t("users.error.user_id_not_found"), HTTPStatuses.BadRequest));
            }

            const findUser = await this._database.models.users.findByPk(id);

            if (!findUser) {
                return next(new UsersError(t("users.error.user_with_id_not_found", { id }), HTTPStatuses.NotFound));
            }

            res.json({ success: true, user: getSafeUserFields(findUser) });
        } catch (error) {
            next(error);
        }
    };
};