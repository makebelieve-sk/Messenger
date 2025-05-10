import { ApiRoutes } from "common-types";

import { type NotificationSettings } from "@core/models/NotificationSettings";
import type Request from "@core/Request";
import Logger from "@service/Logger";
import useUIStore from "@store/ui";
import { type INotificationSettings } from "@custom-types/models.types";

const logger = Logger.init("NotificationSettings");

// Класс, реализовывающий сущность "Настройки уведомлений пользователя" согласно контракту "Настройки уведомлений пользователя"
export default class NotificationSettingsService implements NotificationSettings {
	constructor(private readonly _request: Request, private _settings: INotificationSettings) {
		logger.debug("init");
	}

	get soundEnabled() {
		return Boolean(this._settings.soundEnabled);
	}

	get messageSound() {
		return Boolean(this._settings.messageSound);
	}

	get friendRequestSound() {
		return Boolean(this._settings.friendRequestSound);
	}

	// Обновление глобальных настроек пользователя 
	changeSoundNotifications(data: Omit<INotificationSettings, "userId">) {
		this._request.put({
			route: ApiRoutes.soundNotifications,
			data: { ...data, userId: this._settings.userId },
			setLoading: (isLoading: boolean) => {
				useUIStore.getState().setSaveSettingsModal(isLoading);
			},
			successCb: () => {
				this._settings = {
					userId: this._settings.userId,
					...data,
				};

				useUIStore.getState().setSaveSettingsModal(false);
				useUIStore.getState().setSettingsModal(false);
			},
		});
	}
};