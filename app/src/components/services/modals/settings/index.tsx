import { useEffect, useState } from "react";

import SmallButtonComponent from "@components/services/buttons/small-button";
import SwitchFormGroup from "@components/services/forms/switch-form-group";
import BoxComponent from "@components/ui/box";
import ModalComponent from "@components/ui/modal";
import TypographyComponent from "@components/ui/typography";
import useProfile from "@hooks/useProfile";
import useUser from "@hooks/useUser";
import i18next from "@service/i18n";
import useProfileStore from "@store/profile";
import useUIStore from "@store/ui";
import { type INotificationSettings } from "@custom-types/models.types";

import "./settings.scss";

const MODAL_TITLE = "modal-settings-title";
const MODAL_DESCRIPTION = "modal-settings-description";

// Модальное окно с общими настройками приложения
export default function ModalWithSettings() {
	const [ form, setForm ] = useState<Omit<INotificationSettings, "userId"> | null>(null);

	const isLoadingDeleteAccount = useProfileStore(state => state.isDeleteAccountLoading);
	const openSettingsModal = useUIStore(state => state.settingsModal);
	const isLoading = useUIStore(state => state.saveSettingsModal);

	const profile = useProfile();
	const settingsService = useUser().settingsService;

	// Устанавливаем значения формы настроек
	useEffect(() => {
		setForm(openSettingsModal && settingsService
			? {
				soundEnabled: settingsService.soundEnabled,
				messageSound: settingsService.messageSound,
				friendRequestSound: settingsService.friendRequestSound,
			}
			: null,
		);
	}, [ openSettingsModal, settingsService ]);

	// Обновляем настройки пользователя
	const onChange = (field: keyof Omit<INotificationSettings, "userId">, value: boolean) => {
		setForm(prev => ({
			...prev!,
			[field]: value,
		}));
	};

	// Удаление аккаунта
	const onDeleteAccount = () => {
		useUIStore.getState().setConfirmModal({
			text: i18next.t("ui.sure_delete_account"),
			btnActionTitle: i18next.t("ui.delete"),
			cb: () => profile.deleteAccount(),
		});
	};

	// Сохранение выбранных настроек
	const onSave = () => {
		if (settingsService && form) {
			settingsService.changeSoundNotifications(form);
		}
	};

	// Закрытие модального окна
	const onClose = () => {
		useUIStore.getState().setSettingsModal(false);
	};

	if (!openSettingsModal || !form) {
		return null;
	}

	return <ModalComponent open onClose={onClose} title={MODAL_TITLE} description={MODAL_DESCRIPTION}>
		<BoxComponent className="modal-settings-container">
			<div className="modal-settings-container__header">
				<TypographyComponent id={MODAL_TITLE} variant="subtitle1" component="h2">
					{i18next.t("modals.settings")}
				</TypographyComponent>
			</div>

			<div className="modal-settings-container__content">
				<SwitchFormGroup
					form={form}
					onChange={onChange}
				/>

				<div className="modal-settings-container__content__delete-account">
					<TypographyComponent variant="body1" component="h2">
						{i18next.t("modals.delete-account-title")}
					</TypographyComponent>

					<TypographyComponent variant="body2" component="h4">
						{i18next.t("modals.delete-account-text")}
					</TypographyComponent>

					<SmallButtonComponent variant="outlined" color="error" loading={isLoadingDeleteAccount} onClick={onDeleteAccount}>
						{i18next.t("modals.delete-account")}
					</SmallButtonComponent>
				</div>
			</div>

			<div className="modal-settings-container__buttons">
				<SmallButtonComponent variant="outlined" color="primary" loading={isLoading} onClick={onSave}>
					{i18next.t("modals.save")}
				</SmallButtonComponent>

				<SmallButtonComponent variant="outlined" color="error" onClick={onClose}>
					{i18next.t("modals.cancel")}
				</SmallButtonComponent>
			</div>
		</BoxComponent>
	</ModalComponent>;
};