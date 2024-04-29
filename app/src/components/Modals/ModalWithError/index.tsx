import React from "react";
import Alert from "@mui/material/Alert";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import SnackBarComponent from "../../Common/Snackbar";
import { useAppDispatch, useAppSelector } from "../../../hooks/useGlobalState";
import { selectErrorState, setError } from "../../../state/error/slice";
import { MainClientContext } from "../../App";

import "./modal-with-error.scss";

const modalTitle = "modal-error-title";
const modalDescription = "modal-error-description";

export default React.memo(function ModalWithError() {
    const [open, setOpen] = React.useState(false);
    const [visible, setVisible] = React.useState(false);

    const mainClient = React.useContext(MainClientContext);

    const { error } = useAppSelector(selectErrorState);
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        setOpen(Boolean(error));
    }, [error]);

    // Копирование текста в буфер обмена
    const onCopy = () => {
        if (navigator && navigator.clipboard && error) {
            navigator.clipboard.writeText(error)
                .then(() => {
                    setVisible(true);
                })
                .catch(error => {
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
        window.location.reload();
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
                <Typography id={modalTitle} variant="h6" component="h2">
                    Упс! Возникла ошибка в работе сервера
                </Typography>

                <Typography id={modalDescription} className="modal-error-container__text">
                    Пожалуйста, скопируйте текст ошибки и отправьте её на почту разработчикам: skryabin.aleksey99@gmail.com
                </Typography>

                <div className="modal-error-container__error" onClick={onCopy}>
                    {error}
                </div>

                <Typography id={modalDescription} align="right" className="modal-error-container__button">
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onReload}>Обновить страницу</Button>
                </Typography>
            </Box>
        </Modal>
    </>
});