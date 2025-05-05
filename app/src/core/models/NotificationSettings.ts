import { type INotificationSettings } from "@custom-types/models.types";

// Контракт модели "Настройки уведомлений пользователя"
export interface NotificationSettings {
	soundEnabled: boolean;
	messageSound: boolean;
	friendRequestSound: boolean;

	changeSoundNotifications: (data: Omit<INotificationSettings, "userId">) => void;
};