import { useState, useEffect, useContext, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Alert from "@mui/material/Alert";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";

import SnackBarComponent from "../../../ui/Snackbar";
import { MainClientContext } from "../../../main/Main";
import { useAppDispatch, useAppSelector } from "../../../../hooks/useGlobalState";
import { selectErrorState, setError } from "../../../../store/error/slice";
import { MAIL_FEEDBACK } from "../../../../utils/constants";

import "./modal-with-error.scss";

const modalTitle = "modal-error-title";
const modalDescription = "modal-error-description";

export default memo(function ModalWithError() {
    const [open, setOpen] = useState(false);
    const [visible, setVisible] = useState(false);

    const mainClient = useContext(MainClientContext);

    const { t } = useTranslation();
    const { error } = useAppSelector(selectErrorState);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setOpen(Boolean(error));
    }, [error]);

    // Копирование текста в буфер обмена
    const onCopy = () => {
        if (navigator.clipboard && error) {
            navigator.clipboard.writeText(error)
                .then(() => {
                    setVisible(true);
                })
                .catch((error: Error) => {
                    mainClient.catchErrors(t("modals.error.copy") + error);
                });
        }
    };

    // Закрытие модального окна
    const onClose = (_: Object, reason: string) => {
        if (reason !== "backdropClick") {
            setOpen(false);
            dispatch(setError(null));
        }
    };

    // Обновление страницы
    const onReload = () => {
        navigate(0);
    };

    return <>
        <SnackBarComponent anchor={{ vertical: "top", horizontal: "center" }} open={visible} handleClose={() => setVisible(false)}>
            <Alert className="alert-error-container" onClose={() => setVisible(false)} severity="success">
                { t("modals.copy_successfull") }
            </Alert>
        </SnackBarComponent>

        <Modal 
            open={open} 
            onClose={onClose} 
            aria-labelledby={modalTitle} 
            aria-describedby={modalDescription}
            disableEscapeKeyDown
        >
            <Box className="modal-error-container">
                <Typography variant="h6" component="h2">
                    { t("modals.error.server") }
                </Typography>

                <Typography className="modal-error-container__text">
                    { t("modals.copy_the_message_and_send_to_email", { email: MAIL_FEEDBACK }) }
                </Typography>

                <div className="modal-error-container__error" onClick={onCopy}>
                    {error}
                </div>

                <div className="modal-error-container__button">
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onReload}>{ t("modals.reset_page") }</Button>
                </div>
            </Box>
        </Modal>
    </>
});