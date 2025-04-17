import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

import SnackbarComponent from "@components/ui/snackbar";
import useMainClient from "@hooks/useMainClient";
import i18next from "@service/i18n";
import useUIStore from "@store/ui";
import { MAIL_FEEDBACK } from "@utils/constants";

import "./error.scss";

const MODAL_TITLE = "modal-error-title";
const MODAL_DESCRIPTION = "modal-error-description";
const BACKDROP_CLICK = "backdropClick";

const snackBarAnchor = {
	vertical: "top", 
	horizontal: "center",
} as const;

// Модальное окно с текстом возникшей ошибки (обрабатывает любую ошибку, будь то в коде клиента, АПИ и тд.)
export default function ModalWithError() {
	const error = useUIStore((state) => state.error);
	const [ visibleSnackbar, setVisibleSnackbar ] = useState(false);

	const mainClient = useMainClient();
	const navigate = useNavigate();

	// Копирование текста в буфер обмена
	const onCopy = () => {
		if (error) {
			navigator.clipboard
				.writeText(error)
				.then(() => setVisibleSnackbar(true))
				.catch((error: Error) => {
					useUIStore.getState().setError(i18next.t("modals.error.copy") + error);
				});
		}
	};

	// Закрытие модального окна
	const onClose = (_: Object, reason: string) => {
		if (reason !== BACKDROP_CLICK) {
			useUIStore.getState().setError(null);
		}
	};

	// Скачать файл с логами
	const onDownload = () => {
		mainClient.downloadLogFile();
	};

	// Обновление страницы
	const onReload = () => {
		navigate(0);
	};

	if (!error) return null;

	return <>
		<SnackbarComponent anchor={snackBarAnchor} open={visibleSnackbar} handleClose={() => setVisibleSnackbar(false)}>
			<Alert className="alert-error-container" onClose={() => setVisibleSnackbar(false)} severity="success">
				{i18next.t("modals.copy_successfull")}
			</Alert>
		</SnackbarComponent>

		<Modal 
			open 
			onClose={onClose} 
			aria-labelledby={MODAL_TITLE} 
			aria-describedby={MODAL_DESCRIPTION} 
			disableEscapeKeyDown
		>
			<Box className="modal-error-container">
				<Typography variant="h6" component="h2">
					{i18next.t("modals.error.server")}
				</Typography>

				<Typography className="modal-error-container__text">
					{i18next.t("modals.copy_the_message_and_send_to_email", { email: MAIL_FEEDBACK })}
				</Typography>

				<div className="modal-error-container__error" onClick={onCopy}>
					{error}
				</div>

				<div className="modal-error-container__buttons">
					<Button variant="contained" startIcon={<DownloadIcon />} onClick={onDownload}>
						{i18next.t("modals.download")}
					</Button>

					<Button variant="outlined" startIcon={<RefreshIcon />} onClick={onReload}>
						{i18next.t("modals.reset_page")}
					</Button>
				</div>
			</Box>
		</Modal>
	</>;
}
