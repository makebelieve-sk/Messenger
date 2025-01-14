import { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { useAppDispatch, useAppSelector } from "../../../../hooks/useGlobalState";
import { selectMainState, setModalConfirm } from "../../../../store/main/slice";

import "./modal-with-confirm.scss";

const modalTitle = "modal-confirm-title";
const modalDescription = "modal-confirm-description";

export default memo(function ModalWithConfirm() {
    const [open, setOpen] = useState(false);
    
    const { t } = useTranslation();
    const { modalConfirm } = useAppSelector(selectMainState);
    const dispatch = useAppDispatch();

    useEffect(() => {
        setOpen(Boolean(modalConfirm && modalConfirm.text));
    }, [modalConfirm]);

    // Выполнение действия
    const onAction = () => {
        if (modalConfirm && modalConfirm.cb) {
            modalConfirm.cb();
            dispatch(setModalConfirm(null));
        }
    };

    // Закрытие модального окна
    const onClose = () => {
        dispatch(setModalConfirm(null));
        setOpen(false);
    };

    return <Modal open={open} onClose={onClose} aria-labelledby={modalTitle} aria-describedby={modalDescription}>
        <Box className="modal-confirm-container">
            <Typography id={modalTitle} variant="subtitle1" component="h2">
                {modalConfirm && modalConfirm.text}
            </Typography>

            <Typography id={modalDescription} className="modal-confirm-container__buttons">
                <Button size="small" variant="outlined" color="primary" onClick={onAction}>{modalConfirm && modalConfirm.btnActionTitle}</Button>
                <Button size="small" variant="outlined" color="error" onClick={onClose}>{ t("modals.cancel") }</Button>
            </Typography>
        </Box>
    </Modal>
});