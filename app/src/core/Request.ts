import axios, { type AxiosInstance } from "axios";

import type CatchErrors from "@core/CatchErrors";
import i18next from "@service/i18n";
import Logger from "@service/Logger";
import useUIStore from "@store/ui";
import type { AxiosErrorType, AxiosResponseType } from "@custom-types/axios.types";
import { ApiRoutes, HTTPStatuses } from "@custom-types/enums";
import { API_URL, AXIOS_RESPONSE_ENCODING, AXIOS_TIMEOUT } from "@utils/constants";

const logger = Logger.init("Request");

interface IGetRequest {
	route: ApiRoutes | string;
	setLoading?: (isLoading: boolean) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	successCb?: (result: any) => void;
};

interface IDownloadFileRequest {
	params: string;
	extra: { name: string };
};

interface IPostRequest {
	route: ApiRoutes;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	setLoading?: (isLoading: boolean) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	successCb?: (result: any) => void;
	config?: { headers?: { [key: string]: string } };
};

interface IPutRequest {
	route: ApiRoutes;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	setLoading?: (isLoading: boolean) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	successCb?: (result: any) => void;
};

// Класс, являющийся оберткой над axios, позволяющий давать запросы на сервер по HTTP API
export default class Request {
	private readonly _instance: AxiosInstance;

	constructor(private readonly _catchErrors: CatchErrors) {
		logger.debug("init");

		this._instance = axios.create({
			// Основное URL-адрес для всех запросов
			baseURL: API_URL,
			// Разрешает отправлять cookie и авторизационные заголовки с запросами к другому домену
			withCredentials: true,
			// Время ожидания ответа от сервера (иначе будет выброшена ошибка)
			timeout: AXIOS_TIMEOUT,
			// Объект заголовков HTTP-запросов
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": API_URL,
				"Access-Control-Allow-Methods": "GET,PUT,POST,DELETE",
			},
			// Кодировка, используемая для декодирования ответа от сервера
			responseEncoding: AXIOS_RESPONSE_ENCODING,
		});
	}

	private _errorHandler(error: AxiosErrorType) {
		this._catchErrors.catchAxios(error);
	}

	// GET запрос на сервер
	get({ route, setLoading, successCb }: IGetRequest): void {
		logger.debug(`get [route=${route}]`);

		setLoading ? setLoading(true) : undefined;

		this._instance
			.get(route)
			.then((response: AxiosResponseType) => {
				this._handleSuccessStatuses(response, successCb);
			})
			.catch((error: AxiosErrorType) => {
				this._errorHandler(error);
			})
			.finally(() => {
				setLoading ? setLoading(false) : undefined;
			});
	}

	// GET запрос на скачивание файла с сервера
	downloadFile({ params, extra }: IDownloadFileRequest) {
		logger.debug(`downloadFile [params=${params}, extra.name=${extra.name}]`);

		this._instance
			.get(`${ApiRoutes.downloadFile}?${params}`, { responseType: "blob" })
			.then((response) => {
				const blob = response.data;
				const downloadUrl = window.URL.createObjectURL(blob);

				const link = document.createElement("a");
				link.href = downloadUrl;
				link.download = extra.name;

				document.body.appendChild(link);

				link.click();
				link.remove();
			})
			.catch((error: AxiosErrorType) => {
				this._errorHandler(error);
			});
	}

	// POST запрос на сервер (установка/использование данных)
	post({ route, data, setLoading, successCb, config }: IPostRequest): void {
		const configLogger = config ? `, config=${JSON.stringify(config)}` : "";
		logger.debug(`post [route=${route}, data=${JSON.stringify(data)}${configLogger}]`);

		setLoading ? setLoading(true) : undefined;

		this._instance
			.post(route, data, config)
			.then((response: AxiosResponseType) => {
				this._handleSuccessStatuses(response, successCb);
			})
			.catch((error: AxiosErrorType) => {
				this._errorHandler(error);
			})
			.finally(() => {
				setLoading ? setLoading(false) : undefined;
			});
	}

	// PUT запрос на сервер (изменение/обновление данных)
	put({ route, data, setLoading, successCb }: IPutRequest): void {
		logger.debug(`put [route=${route}, data=${JSON.stringify(data)}]`);

		setLoading ? setLoading(true) : undefined;

		this._instance
			.put(route, data)
			.then((response: AxiosResponseType) => {
				this._handleSuccessStatuses(response, successCb);
			})
			.catch((error: AxiosErrorType) => {
				this._errorHandler(error);
			})
			.finally(() => {
				setLoading ? setLoading(false) : undefined;
			});
	}

	// Обработка положительного статуса HTTP
	private _handleSuccessStatuses(response: AxiosResponseType, cb?: Function) {
		const { data, status } = response;

		switch (status) {
		case HTTPStatuses.OK:
		case HTTPStatuses.Created: {
			if (data.success) {
				cb ? cb(data) : undefined;
			}
			break;
		}
		case HTTPStatuses.NoContent: {
			cb ? cb() : undefined;
			break;
		}
		default:
			useUIStore.getState().setError(i18next.t("core.request.unknown_status", { status }));
		}
	}
}
