import BoxComponent from "@components/ui/box";
import { SmallButtonComponent } from "@components/ui/button/small-button";
import ModalComponent from "@components/ui/modal";
import TypographyComponent from "@components/ui/typography";
import i18next from "@service/i18n";
import useUIStore from "@store/ui";

import "./confirm.scss";

const MODAL_TITLE = "modal-confirm-title";
const MODAL_DESCRIPTION = "modal-confirm-description";

export interface IConfirmModalData {
	text: string;
	btnActionTitle: string;
	cb?: () => void;
};

// Модальное окно с подтверждением операции (например, удаление фотографии/аватара)
export default function ModalWithConfirm() {
	const confirmModal = useUIStore((state) => state.confirmModal);

	// Выполнение действия
	const onAction = () => {
		if (confirmModal && confirmModal.cb) confirmModal.cb();

		onClose();
	};

	// Закрытие модального окна
	const onClose = () => {
		useUIStore.getState().setConfirmModal(null);
	};

	if (!confirmModal) return null;

	return <ModalComponent open onClose={onClose} title={MODAL_TITLE} description={MODAL_DESCRIPTION}>
		<BoxComponent className="modal-confirm-container">
			<TypographyComponent id={MODAL_TITLE} variant="subtitle1" component="h2">
				{confirmModal.text}
			</TypographyComponent>

			<TypographyComponent id={MODAL_DESCRIPTION} className="modal-confirm-container__buttons">
				<SmallButtonComponent variant="outlined" color="primary" onClick={onAction}>
					{confirmModal.btnActionTitle}
				</SmallButtonComponent>

				<SmallButtonComponent variant="outlined" color="error" onClick={onClose}>
					{ i18next.t("modals.cancel") }
				</SmallButtonComponent>
			</TypographyComponent>
		</BoxComponent>
	</ModalComponent>;
}
