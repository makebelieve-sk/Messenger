import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiRoutes } from "../types/enums";
import CatchErrors, { CatchType } from "./CatchErrors";
import { SERVER_URL } from "../utils/constants";

interface IConstructor {
    catchErrors: CatchErrors;
};

// Класс, отвечающий за запросы к серверу
export default class Request {
    private _instance: AxiosInstance;
    private _catchErrors: CatchErrors;

    constructor({ catchErrors }: IConstructor) {
        this._instance = this._createInstance();
        this._catchErrors = catchErrors;
    };

    private _createInstance() {
        return axios.create({
            baseURL: SERVER_URL,
            withCredentials: true,
            timeout: 15000,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": SERVER_URL ?? false,
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE"
            }
        });
    };

    private _errorHandler(error: AxiosError, failedText?: string): CatchType {
        return this._catchErrors.catch(`${error.name}: ${error.message}\n${failedText}`, error);
    }

    // GET запрос на сервер
    public get(
        route: ApiRoutes | string,
        setLoading: ((value: any) => any) | undefined,
        successCb: ((result: any) => any) | undefined,
        failedText?: string
    ): void {
        setLoading ? setLoading(true) : undefined;

        this._instance
            .get(route)
            .then(response => {
                const data = response.data;

                if (data.success) {
                    successCb ? successCb(data) : undefined;
                }
            })
            .catch((error: AxiosError) => this._errorHandler(error, failedText))
            .finally(() => {
                setLoading ? setLoading(false) : undefined;
            });
    };

    // POST запрос на сервер
    public post(
        route: ApiRoutes,
        data: any,
        setLoading?: ((value: React.SetStateAction<boolean>) => void) | undefined,
        successCb?: ((result: any) => any) | undefined,
        failedText?: string,
        finallyCb?: () => any,
        config?: { headers?: { [key: string]: string; }; },
        failedCb?: (error: CatchType) => any
    ): void {
        setLoading ? setLoading(true) : undefined;

        this._instance
            .post(route, data, config)
            .then(response => {
                const data = response.data;

                if (data.success) {
                    successCb ? successCb(data) : undefined;
                }
            })
            .catch((error: AxiosError) => {
                const err = this._errorHandler(error, failedText);

                if (failedCb) failedCb(err);
            })
            .finally(() => {
                setLoading ? setLoading(false) : undefined;
                finallyCb ? finallyCb() : undefined;
            });
    };

    // GET запрос на скачивание файла с сервера
    public downloadFile(
        window: Window & typeof globalThis,
        document: Document,
        params: string,
        extra: { name: string; },
        failedText: string
    ) {
        this._instance
            .get(`${ApiRoutes.downloadFile}?${params}`, { responseType: "blob" })
            .then(response => {
                const blob = response.data;
                const downloadUrl = window.URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = extra.name;

                document.body.appendChild(link);

                link.click();
                link.remove();
            })
            .catch((error: AxiosError) => this._errorHandler(error, failedText))
    }
};