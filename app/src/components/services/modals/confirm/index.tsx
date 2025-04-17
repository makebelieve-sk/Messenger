import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

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

	return <Modal open onClose={onClose} aria-labelledby={MODAL_TITLE} aria-describedby={MODAL_DESCRIPTION}>
		<Box className="modal-confirm-container">
			<Typography id={MODAL_TITLE} variant="subtitle1" component="h2">
				{confirmModal.text}
			</Typography>

			<Typography id={MODAL_DESCRIPTION} className="modal-confirm-container__buttons">
				<Button size="small" variant="outlined" color="primary" onClick={onAction}>
					{confirmModal.btnActionTitle}
				</Button>

				<Button size="small" variant="outlined" color="error" onClick={onClose}>
					{i18next.t("modals.cancel")}
				</Button>
			</Typography>
		</Box>
	</Modal>;
}
