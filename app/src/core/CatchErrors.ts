import { AxiosError } from "axios";
import EventEmitter from "eventemitter3";

import i18next from "@service/i18n";
import Logger from "@service/Logger";
import { setError } from "@store/error/slice";
import { ErrorCodes, HTTPStatuses, Pages } from "@custom-types/enums";
import { MainClientEvents } from "@custom-types/events";
import { AppDispatch } from "@custom-types/redux.types";

type BadRequestType = { success: boolean; message: string; field?: string; } | string | null;
export type CatchType = BadRequestType | string | null;

const logger = Logger.init("CatchErrors");

const ERROR_MESSAGE = i18next.t("core.catch-errors.error");
const ERROR_NETWORK = i18next.t("core.catch-errors.error.timeout");
const ERROR_TIMEOUT = i18next.t("core.catch-errors.error.network");
const ERROR_BAD_REQUEST = i18next.t("core.catch-errors.error.bad_request");
const ERROR_CANCELED = i18next.t("core.catch-errors.error.canceled");
const ERROR_UNKNOWN = i18next.t("core.catch-errors.error.unknown");

// Класс, отвечающий за обработку ошибок. Обрабатывает как ошибки по HTTP API, так и прочие ошибки, возникающие на стороне клиента
export default class CatchErrors extends EventEmitter {
    private _errorText: string = "";
    private _axiosError: AxiosError | undefined = undefined;

    constructor(private readonly _dispatch: AppDispatch) {
        super();
    }

    get error() {
        return this._axiosError
            ? this._axiosError.message
            : this._errorText || ERROR_MESSAGE;
    }

    catch(errorText: string, axiosError?: AxiosError): CatchType {
        this._errorText = errorText;
        this._axiosError = axiosError;

        logger.error(this.error);

        if (this._axiosError) {
            // Сервер вернул ответ с ошибкой (в объекте ответа присутствует статус ошибки)
            if (this._axiosError.response) {
                const { status } = this._axiosError.response;

                switch (status) {
                    case HTTPStatuses.PermanentRedirect: return this._permanentRedirect();
                    case HTTPStatuses.BadRequest: return this._badRequest();
                    case HTTPStatuses.Unauthorized: return this._unauthorized();
                    case HTTPStatuses.Forbidden: return this._forbidden();
                    case HTTPStatuses.NotFound: return this._notFound();
                    case HTTPStatuses.ServerError:
                    default: 
                        return this._serverError();
                };
            }
            
            // Сервер не вернул объект ошибки (статуса ошибки нет)
            if (this._axiosError.code) {
                return this._errorHandler(this._axiosError);
            }
        }

        return this._serverError();
    };

    private _errorHandler(error: AxiosError) {
        const { code, message } = error;

        let errorText: string;

        switch (code) {
            case ErrorCodes.ERR_NETWORK: {
                errorText = ERROR_NETWORK;
                break;
            }
            case ErrorCodes.ERR_TIMEOUT: {
                errorText = ERROR_TIMEOUT;
                break;
            }
            case ErrorCodes.ERR_BAD_REQUEST: {
                errorText = ERROR_BAD_REQUEST;
                break;
            }
            case ErrorCodes.ERR_CANCELED: {
                errorText = ERROR_CANCELED;
                break;
            } 
            default:
                errorText = ERROR_UNKNOWN + message;
        }

        this._dispatch(setError(errorText));
        return null;
    }

    // Статус 308
    private _permanentRedirect(): null {
        this.emit(MainClientEvents.REDIRECT, Pages.profile);
        return null;
    };

    // Статус 400
    private _badRequest(): BadRequestType | string {
        return this._axiosError
            ? this._axiosError.response
                ? this._axiosError.response.data as BadRequestType
                : this._axiosError.message
            : this._errorText || ERROR_MESSAGE;
    };

    // Статус 401
    private _unauthorized(): null {
        this.emit(MainClientEvents.REDIRECT, window.location.pathname !== Pages.signUp ? Pages.signIn : Pages.signUp);
        return null;
    };

    // Статус 403
    private _forbidden(): null {
        this.emit(MainClientEvents.REDIRECT, Pages.signIn);
        return null;
    };

    // Статус 404
    private _notFound(): null {
        this._dispatch(setError(this.error));
        return null;
    };

    // Статус 500
    private _serverError(): null {
        this._dispatch(setError(this.error));
        return null;
    };
};