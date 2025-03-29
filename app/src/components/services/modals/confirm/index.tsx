import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CommonModal from "@components/ui/modal";
import TypographyComponent from "@components/ui/typography";
import ButtonComponent from "@components/ui/button";
import BoxComponent from "@components/ui/box";

import eventBus from "@utils/event-bus";
import { GlobalEvents } from "@custom-types/events";

import "./confirm.scss";

const modalTitle = "modal-confirm-title";
const modalDescription = "modal-confirm-description";

// Начальное состояние модального окна с подтверждением
const initialModalData: IModalConfirmData = {
    text: "",
    btnActionTitle: "",
    cb: undefined
};

export interface IModalConfirmData {
    text: string;
    btnActionTitle: string;
    cb?: () => void;
};

// Модальное окно с подтверждением операции (например, удаление фотографии/аватара)
export default function ModalWithConfirm() {
    const [open, setOpen] = useState(false);
    const [modalData, setModalData] = useState(initialModalData);

    const { t } = useTranslation();

    useEffect(() => {
        // После установки данных модального окна необходимо обновить состояние для корректного отображения
        eventBus.on(GlobalEvents.SET_MODAL_CONFIRM, onSetModalData);

        // Отписываемся от данного события при размонтировании, чтобы избежать утечки памяти
        return () => {
            eventBus.off(GlobalEvents.SET_MODAL_CONFIRM, onSetModalData);
        }
    }, []);

    // Обработчик события SET_MODAL_CONFIRM
    const onSetModalData = (data: IModalConfirmData) => {
        setOpen(Boolean(data));
        setModalData(data);
    }

    // Выполнение действия
    const onAction = () => {
        if (modalData.cb) modalData.cb();

        onClose();
    };

    // Закрытие модального окна
    const onClose = () => {
        setOpen(false);
        setModalData(initialModalData);
    };

    return <CommonModal isOpen={open} onClose={onClose} title={modalTitle} description={modalDescription}>
        <BoxComponent className="modal-confirm-container">
            <TypographyComponent id={modalTitle} variant="subtitle1" component="h2">
                {modalData.text}
            </TypographyComponent>

            <TypographyComponent id={modalDescription} className="modal-confirm-container__buttons">
                <ButtonComponent size="small" variant="outlined" color="primary" onClick={onAction}>{modalData.btnActionTitle}</ButtonComponent>
                <ButtonComponent size="small" variant="outlined" color="error" onClick={onClose}>{t("modals.cancel")}</ButtonComponent>
            </TypographyComponent>
        </BoxComponent>
    </CommonModal>
};