import { Request, Response, NextFunction } from "express";
import { ErrorTextsApi, HTTPStatuses, RedisKeys } from "../types/enums";
import { IUser } from "../types/models.types";
import { getExpiredToken } from "../utils/token";
import RedisWorks from "./Redis";

interface IConstructor {
    redisWork: RedisWorks;
}

export default class Middleware {
    private _redisWork: RedisWorks;

    constructor({ redisWork }: IConstructor) {
        this._redisWork = redisWork;
    }

    // Пользователь должен быть авторизован в системе
    public async mustAuthenticated(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.isAuthenticated()) {
                return res.status(HTTPStatuses.Unauthorized).send({ success: false, message: ErrorTextsApi.NOT_AUTH_OR_TOKEN_EXPIRED });
            }

            const userId = (req.user as IUser).id;

            // Получаем поле rememberMe из Redis
            const rememberMe = await this._redisWork.get(RedisKeys.REMEMBER_ME, userId);
        
            // Обновляем время жизни токена сессии
            req.session.cookie.expires = getExpiredToken(Boolean(rememberMe));
        
            next();
        } catch (error: any) {
            console.log(error);
            return res.status(HTTPStatuses.ServerError).send({ success: false, message: error.message ?? error });
        }
    }
}