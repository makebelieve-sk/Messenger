import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";

import BoxComponent from "@components/ui/box";
import ButtonComponent from "@components/ui/button";
import ModalComponent from "@components/ui/modal";
import SnackbarComponent from "@components/ui/snackbar";
import TypographyComponent from "@components/ui/typography";
import useMainClient from "@hooks/useMainClient";
import i18next from "@service/i18n";
import useUIStore from "@store/ui";
import { MAIL_FEEDBACK } from "@utils/constants";

import "./error.scss";

const MODAL_TITLE = "modal-error-title";
const MODAL_DESCRIPTION = "modal-error-description";

const snackBarAnchor = { vertical: "bottom", horizontal: "left" } as const;

// Модальное окно с текстом возникшей ошибки (обрабатывает любую ошибку, будь то в коде клиента, АПИ и тд.)
export default function ModalWithError() {
	const error = useUIStore(state => state.error);
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
	const onClose = () => {
		useUIStore.getState().setError(null);
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
		<SnackbarComponent 
			anchor={snackBarAnchor} 
			open={visibleSnackbar} 
			message={i18next.t("modals.copy_successfull")}
			handleClose={() => setVisibleSnackbar(false)}
		/>

		<ModalComponent
			open
			onClose={onClose}
			title={MODAL_TITLE}
			description={MODAL_DESCRIPTION}
			disableEscapeKeyDown
		>
			<BoxComponent className="modal-error-container">
				<TypographyComponent variant="h6" component="h2">
					{i18next.t("modals.error.server")}
				</TypographyComponent>

				<TypographyComponent className="modal-error-container__text">
					{i18next.t("modals.copy_the_message_and_send_to_email", { email: MAIL_FEEDBACK })}
				</TypographyComponent>

				<div className="modal-error-container__error" onClick={onCopy}>
					{error}
				</div>

				<div className="modal-error-container__buttons">
					<ButtonComponent variant="contained" startIcon={<DownloadIcon />} onClick={onDownload}>
						{i18next.t("modals.download")}
					</ButtonComponent>
                    
					<ButtonComponent variant="outlined" startIcon={<RefreshIcon />} onClick={onReload}>
						{i18next.t("modals.reset_page")}
					</ButtonComponent>
				</div>
			</BoxComponent>
		</ModalComponent>
	</>;
};