import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";

import AlertComponent from "@components/ui/alert";
import CommonModal from "@components/ui/modal";
import BoxComponent from "@components/ui/box";
import SnackBarComponent from "@components/ui/snackbar";
import TypographyComponent from "@components/ui/typography";
import ButtonComponent from "@components/ui/button";
import useMainClient from "@hooks/useMainClient";
import { useAppDispatch, useAppSelector } from "@hooks/useGlobalState";
import { selectErrorState, setError } from "@store/error/slice";
import { MAIL_FEEDBACK } from "@utils/constants";

import "./error.scss";

const modalTitle = "modal-error-title";
const modalDescription = "modal-error-description";
const BACKDROP_CLICK = "backdropClick";

// Модальное окно с текстом возникшей ошибки (обрабатывает любую ошибку, будь то в коде клиента, АПИ и тд.)
export default function ModalWithError() {
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false);

    const mainClient = useMainClient();
    const { t } = useTranslation();
    const { error } = useAppSelector(selectErrorState);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setOpen(Boolean(error));
    }, [error]);

    // Копирование текста в буфер обмена
    const onCopy = () => {
        if (error) {
            navigator.clipboard
                .writeText(error)
                .then(() => setVisible(true))
                .catch((error: Error) => {
                    mainClient.catchErrors(t("modals.error.copy") + error);
                });
        }
    };

    // Закрытие модального окна
        const onClose = (_?: Object, reason?: string) => {
            if (reason !== BACKDROP_CLICK) {
                setOpen(false);
                dispatch(setError(null));
            }
        };

    // Скачать файл с логами
    const onDownload = () => {
        mainClient.downloadLogFile();
    }

    // Обновление страницы
    const onReload = () => {
        navigate(0);
    };

    return <>
        <SnackBarComponent anchor={{ vertical: "top", horizontal: "center" }} open={visible} handleClose={() => setVisible(false)}>
            <AlertComponent className="alert-error-container" onClose={() => setVisible(false)} severity="success">
                {t("modals.copy_successfull")}
            </AlertComponent>
        </SnackBarComponent>

        <CommonModal
            isOpen={open}
            onClose={onClose}
            title={modalTitle}
            description={modalDescription}
            disableEscapeKeyDown
        >
            <BoxComponent className="modal-error-container">
                <TypographyComponent variant="h6" component="h2">
                    {t("modals.error.server")}
                </TypographyComponent>

                <TypographyComponent className="modal-error-container__text">
                    {t("modals.copy_the_message_and_send_to_email", { email: MAIL_FEEDBACK })}
                </TypographyComponent>

                <div className="modal-error-container__error" onClick={onCopy}>
                    {error}
                </div>

                <div className="modal-error-container__buttons">
                    <ButtonComponent variant="contained" startIcon={<DownloadIcon />} onClick={onDownload}>{t("modals.download")}</ButtonComponent>
                    <ButtonComponent variant="outlined" startIcon={<RefreshIcon />} onClick={onReload}>{t("modals.reset_page")}</ButtonComponent>
                </div>
            </BoxComponent>
        </CommonModal>
    </>
};