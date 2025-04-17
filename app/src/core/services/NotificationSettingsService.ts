import { type NotificationSettings } from "@core/models/NotificationSettings";
import Logger from "@service/Logger";
import { type INotificationSettings } from "@custom-types/models.types";

const logger = Logger.init("NotificationSettings");

// Класс, реализовывающий сущность "Настройки уведомлений пользователя" согласно контракту "Настройки уведомлений пользователя"
export default class NotificationSettingsService implements NotificationSettings {
	constructor(private _settings: INotificationSettings) {
		logger.debug("init");
	}

	get settings() {
		return this._settings;
	}
}
