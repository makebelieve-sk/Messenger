import { useState, memo } from "react";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";

import { IModalConfirmData } from "@components/services/modals/confirm";
import useImage from "@hooks/useImage";
import { NO_PHOTO } from "@utils/constants";
import eventBus from "@utils/event-bus";
import { GlobalEvents } from "@custom-types/events";

import "./photo.scss";

interface IPhotoComponent {
    src: string;
    alt: string;
    showVisibleIcon?: boolean;
    clickHandler?: () => void;
    deleteHandler?: () => void;
};

// Базовый компонент фотографии
export default memo(function PhotoComponent({ src, alt, showVisibleIcon = true, clickHandler, deleteHandler }: IPhotoComponent) {
    const [visibleCloseIcon, setVisibleCloseIcon] = useState(false);

    const { t } = useTranslation();
    const srcImage = useImage(src);

    // Клик по изображению
    const onClick = () => {
        clickHandler ? clickHandler() : undefined;
    }
    
    // Обработка наведения на изображение
    const onMouseOver = () => {
        if (showVisibleIcon && src && src !== NO_PHOTO) setVisibleCloseIcon(true);
    };

    // Обработка ухода курсора с изображения
    const onMouseOut = () => {
        if (showVisibleIcon && src) setVisibleCloseIcon(false);
    };

    // Удаление изображения
    const onDelete = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        if (visibleCloseIcon && deleteHandler) {
            eventBus.emit(GlobalEvents.SET_MODAL_CONFIRM, {
                text: t("ui.sure_delete_photo"),
                btnActionTitle: t("ui.delete"),
                cb: deleteHandler
            } as IModalConfirmData);

            // Останавливаем всплытие события
            event.stopPropagation();
        }
    };

    return <div 
        className="photo"
        onClick={onClick} 
        onMouseEnter={onMouseOver} 
        onMouseLeave={onMouseOut}
    >
        {visibleCloseIcon 
            ? <div className="photo__close-icon" onClick={onDelete}>
                <CloseIcon color="primary" fontSize="small" />
            </div>
            : null
        }
            
        <img src={srcImage} alt={alt} />
    </div>
});