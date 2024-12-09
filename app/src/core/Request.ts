import axios, { AxiosError, AxiosInstance } from "axios";

import { ApiRoutes } from "../types/enums";
import CatchErrors, { CatchType } from "./CatchErrors";
import { SERVER_URL } from "../utils/constants";

interface IGetRequest {
    route: ApiRoutes | string;
    setLoading?: ((value: any) => any);
    successCb?: ((result: any) => any);
    failedText?: string;
};

interface IPostRequest {
    route: ApiRoutes;
    data: any;
    setLoading?: ((value: React.SetStateAction<boolean>) => void);
    successCb?: ((result: any) => any);
    failedText?: string;
    finallyCb?: () => any;
    config?: { headers?: { [key: string]: string; }; };
    failedCb?: (error: CatchType) => any;
};

interface IDownloadFileRequest {
    window: Window & typeof globalThis;
    document: Document;
    params: string;
    extra: { name: string; };
    failedText: string;
};

// Класс, являющийся оберткой над axios, позволяющий давать запросы на сервер по HTTP API
export default class Request {
    private readonly _instance: AxiosInstance;

    constructor(private readonly _catchErrors: CatchErrors) {
        this._instance = axios.create({
            baseURL: SERVER_URL,                                            // Основное URL-адрес для всех запросов
            withCredentials: true,                                          // Разрешает отправлять cookie и авторизационные заголовкис запросами к другому домену
            timeout: 15000,                                                 // Время ожидания ответа от сервера (иначе будет выброшена ошибка)
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": SERVER_URL ?? false,
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE"
            },                                                              // Объект заголовков HTTP-запросов
            responseEncoding: "utf8"                                        // Кодировка, используемая для декодирования ответа от сервера
        });
    };

    private _errorHandler(error: AxiosError, failedText?: string): CatchType {
        return this._catchErrors.catch(`${error.name}: ${error.message}\n${failedText}`, error);
    }

    // GET запрос на сервер
    get({ route, setLoading, successCb, failedText }: IGetRequest): void {
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
    post({ route, data, setLoading, successCb, failedText, finallyCb, config, failedCb }: IPostRequest): void {
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
    downloadFile({ window, document, params, extra, failedText }: IDownloadFileRequest) {
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