import EventEmitter from "eventemitter3";
import { AxiosError } from "axios";

import { setError } from "../state/error/slice";
import { HTTPStatuses, Pages } from "../types/enums";
import { AppDispatch } from "../types/redux.types";
import { MainClientEvents } from "../types/events";

type BadRequestType = { success: boolean; message: string; field?: string; } | string | null;
export type CatchType = BadRequestType | string | null;

const ERROR_MESSAGE = "Ошибка";
const ERROR_TIMEOUT = "Возникли проблемы с БД или время ожидания ответа превысило 15 секунд";

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

    public catch(errorText: string, axiosError?: AxiosError): CatchType {
        this._errorText = errorText;
        this._axiosError = axiosError;

        console.error(this._axiosError);

        if (this._axiosError) {
            if (this._axiosError.response) {
                const { status } = this._axiosError.response;

                switch (status) {
                    case HTTPStatuses.PermanentRedirect: return this._permanentRedirect();
                    case HTTPStatuses.BadRequest: return this._badRequest();
                    case HTTPStatuses.Unauthorized: return this._unauthorized();
                    case HTTPStatuses.Forbidden: return this._forbidden();
                    case HTTPStatuses.NotFound: return this._notFound();
                    case HTTPStatuses.ServerError: return this._serverError();
                    default: return this._serverError();
                };
            } else if (this._axiosError.request) {
                return this._timeoutError();
            } else {
                return this._serverError();
            }
        } else {
            return this._serverError();
        }
    };

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

    // Время ожидания ответа от сервера
    private _timeoutError(): null {
        this._dispatch(setError(ERROR_TIMEOUT));
        return null;
    };
};