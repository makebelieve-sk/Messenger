import i18next from "@service/i18n";
import Logger from "@service/Logger";
import useAuthStore from "@store/auth";
import useGlobalStore from "@store/global";
import resetAllStores from "@store/index";
import useProfileStore from "@store/profile";
import useUIStore from "@store/ui";
import type { AxiosErrorType, AxiosResponseType } from "@custom-types/axios.types";
import { ErrorCodes, HTTPErrorTypes, HTTPStatuses, Pages } from "@custom-types/enums";

const logger = Logger.init("CatchErrors");

const ERROR_MESSAGE = i18next.t("core.catch-errors.error");
const ERROR_NETWORK = i18next.t("core.catch-errors.error.timeout");
const ERROR_TIMEOUT = i18next.t("core.catch-errors.error.network");
const ERROR_BAD_REQUEST = i18next.t("core.catch-errors.error.bad_request");
const ERROR_CANCELED = i18next.t("core.catch-errors.error.canceled");
const ERROR_UNKNOWN = i18next.t("core.catch-errors.error.unknown");

// Класс, отвечающий за обработку ошибок по HTTP API
export default class CatchErrors {
	private _errorText!: string;
	private _axiosError!: AxiosErrorType;
	private _response!: AxiosResponseType;

	constructor() {
		logger.debug("init");
	}

	// Обработка ошибки по API (вызывается только из класса Request)
	catchAxios(axiosError: AxiosErrorType) {
		this._axiosError = axiosError;

		const { response, code, message = ERROR_MESSAGE } = this._axiosError;

		// Сначала проверяем ответ от сервера с объектом ошибки (в объекте ответа присутствует статус ошибки)
		if (response) {
			this._response = response;
			this._errorText = response.data.message || ERROR_MESSAGE;

			switch (response.status) {
			case HTTPStatuses.PermanentRedirect: {
				this._permanentRedirect();
				break;
			}
			case HTTPStatuses.BadRequest: {
				this._badRequest();
				break;
			}
			case HTTPStatuses.Unauthorized: {
				this._unAuthorized();
				break;
			}
			case HTTPStatuses.Forbidden: {
				this._forbidden();
				break;
			}
			case HTTPStatuses.NotFound: {
				this._notFound();
				break;
			}
			case HTTPStatuses.Conflict: {
				this._conflict();
				break;
			}
			case HTTPStatuses.PayloadTooLarge: {
				this._payloadTooLarge();
				break;
			}
			case HTTPStatuses.TooManyRequests: {
				this._tooManyRequests();
				break;
			}
			case HTTPStatuses.ServerError:
			default:
				this._serverError();
			}

			return;
		}

		// Сервер не вернул объект ошибки (то есть, статуса ошибки нет). Значит нужно проверить по возвращаемому статусу
		if (code) {
			this._errorHandler();
			return;
		}

		// Если в ответе axios нет вообще ничего, возвращает простую ошибку
		this._errorText = message;
		this._handleError();
	}

	private _errorHandler() {
		const { code, message } = this._axiosError;

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

		this._errorText = errorText;
		this._handleError();
	}

	// Статус 308
	private _permanentRedirect() {
		useGlobalStore.getState().setRedirectTo(Pages.profile);
	}

	// Статус 400
	private _badRequest() {
		const { type, fields, field } = this._response.data.options;

		switch (type) {
		// Уведомляем компонент страницы регистрации о том, что пользователь пропустил обязательные поля (подчеркиваем пропущенные поля)
		case HTTPErrorTypes.SIGN_UP: {
			useAuthStore.getState().setSignUpErrors({ status: this._response.status, fields });
			break;
		}
		/**
		 * Уведомляем компонент страницы редактирования информации профиля о том,
		 * что пользователь ввел не правильные поля (подчеркиваем оба поля: "логин" и "пароль").
		 */
		case HTTPErrorTypes.EDIT_INFO: {
			useProfileStore.getState().setEditErrors({ field, fields });
			break;
		}
		default:
			this._handleError();
		}
	}

	// Статус 401
	private _unAuthorized() {
		switch (this._response.data.options.type) {
		// Уведомляем компонент страницы входа о том, что пользователь ввел не правильные поля (подчеркиваем оба поля: "логин" и "пароль")
		case HTTPErrorTypes.SIGN_IN: {
			useAuthStore.getState().setSignInErrors(true);
			break;
		}
		default:
			this._redirect();
		}
	}

	// Статус 403
	private _forbidden() {
		this._redirect();
	}

	// Статус 404
	private _notFound() {
		this._handleError();
	}

	// Статус 409 (конфликт в данных, то есть пытаемся перезаписать уже существующие записи)
	private _conflict() {
		const { message = ERROR_MESSAGE, options } = this._response.data;
		const { type, field } = options;

		switch (type) {
		// Уведомляем компонент страницы регистрации о том, что пользователь ввел существующие (конфликтующие) поля (подчеркиваем конфликтующие поля)
		case HTTPErrorTypes.SIGN_UP: {
			useAuthStore.getState().setSignUpErrors({ status: this._response.status, field, message });
			break;
		}
		default:
			this._handleError();
		}
	}

	// Статус 413 (в запросе были обнаружены большие данные, как пример: добавление фотографий)
	private _payloadTooLarge() {
		this._systemError();
	}

	// Статус 429 (превышен лимит запросов к ендпоинту от пользователя - см. server/config/rate-limiter.config.ts)
	private _tooManyRequests() {
		this._systemError();
	}

	// Статус 500
	private _serverError() {
		this._handleError();
	}

	// Редирект из-за отсутствия аутентификации (вернее сначала мы обнуляем пользователя, далее происходит редирект)
	private _redirect() {
		resetAllStores();
	}

	// Обработка системной ошибки (её вывод в SnackbarComponent)
	private _systemError() {
		useUIStore.getState().setSnackbarError(this._response.data.message);
	}

	// Общая обработка ошибки API на клиенте
	private _handleError() {
		logger.error(this._errorText);
		useUIStore.getState().setError(this._errorText);
	}
}
