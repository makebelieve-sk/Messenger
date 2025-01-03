import React from "react";
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useAppDispatch, useAppSelector } from "../../../hooks/useGlobalState";
import useMainClient from "../../../hooks/useMainClient";
import { selectErrorState, setError } from "../../../state/error/slice";
import { MAIL_FEEDBACK } from "../../../utils/constants";
import SnackBarComponent from "../../Common/Snackbar";

import "./modal-with-error.scss";

const modalTitle = "modal-error-title";
const modalDescription = "modal-error-description";

export default function ModalWithError() {
    const [open, setOpen] = React.useState(false);
    const [visible, setVisible] = React.useState(false);

    const mainClient = useMainClient();

    const { error } = useAppSelector(selectErrorState);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    React.useEffect(() => {
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
                    mainClient.catchErrors("Ошибка при копировании текста в буфер обмена: " + error);
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
                Текст успешно скопирован в буфер обмена!
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
                    Упс! Возникла ошибка в работе сервера
                </Typography>

                <Typography className="modal-error-container__text">
                    Пожалуйста, скопируйте текст ошибки и отправьте её на почту разработчикам: {MAIL_FEEDBACK}
                </Typography>

                <div className="modal-error-container__error" onClick={onCopy}>
                    {error}
                </div>

                <div className="modal-error-container__button">
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onReload}>Обновить страницу</Button>
                </div>
            </Box>
        </Modal>
    </>
};