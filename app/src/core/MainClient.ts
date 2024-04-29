import { NavigateFunction } from "react-router-dom";

import { setUser } from "../state/user/slice";
import { setLoading } from "../state/main/slice";
import { ApiRoutes } from "../types/enums";
import { IUser } from "../types/models.types";
import { AppDispatch, StoreType } from "../types/redux.types";
import CatchErrors, { CatchType } from "./CatchErrors";
import Request from "./Request";
import Socket from "./socket/Socket";

interface IConstructor {
    store: StoreType;
    dispatch: AppDispatch;
};

// TODO
// 1) Перепроверить всю аутентификацию
// 2) Создать новый репозиторий в гитхабе
// 3) Реализовать главную страницу

export default class MainClient {
    _store: StoreType;
    _socket: Socket | undefined = undefined;
    _request: Request;
    _catchErrors: CatchErrors;
    _navigate: NavigateFunction | undefined = undefined;
    _dispatch: AppDispatch;

    constructor({ store, dispatch }: IConstructor) {
        this._store = store;
        this._dispatch = dispatch;

        this._catchErrors = new CatchErrors({ dispatch: this._dispatch });
        this._request = new Request({ catchErrors: this._catchErrors });
    }

    public setNavigate(navigate: NavigateFunction) {
        this._navigate = navigate;

        this._catchErrors.setNavigate(this._navigate);
    }

    public getUser() {
        this.getRequest(
            ApiRoutes.getUser,
            (loading: boolean) => this._dispatch(setLoading(loading)),
            (data: { success: boolean, user: IUser }) => this._dispatch(setUser(data.user))
        );
    }

    public catchErrors(error: string) {
        this._catchErrors.catch(error);
    }

    public getRequest(
        route: ApiRoutes | string,
        setLoading: ((value: any) => any) | undefined,
        successCb: ((result: any) => any) | undefined,
        failedText?: string
    ) {
        this._request.get(route, setLoading, successCb, failedText);
    }

    public postRequest(
        route: ApiRoutes,
        data: any,
        setLoading?: ((value: React.SetStateAction<boolean>) => void) | undefined,
        successCb?: ((result: any) => any) | undefined,
        failedText?: string,
        finallyCb?: () => any,
        config?: { headers?: { [key: string]: string; }; },
        failedCb?: (error: CatchType) => any
    ) {
        this._request.post(route, data, setLoading, successCb, failedText, finallyCb, config, failedCb);
    }

    public downloadFileRequest(
        window: Window & typeof globalThis,
        document: Document,
        params: string,
        extra: { name: string; },
        failedText: string
    ) {
        this._request.downloadFile(window, document, params, extra, failedText);
    }

    // TODO Удалить после рефакторинга звонков (useWebRTC)
    public getSocket() {
        if (!this._socket) {
            this.initSocket();
        }

        return this._socket?.getSocketInstance();
    }

    public initSocket() {
        if (!this._socket) {
            this._socket = new Socket({
                store: this._store,
                navigate: this._navigate as NavigateFunction,
                dispatch: this._dispatch
            });
        }
    }
}