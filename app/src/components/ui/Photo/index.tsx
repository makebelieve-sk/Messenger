import { useState, memo } from "react";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";

import useImage from "../../../hooks/useImage";
import { useAppDispatch } from "../../../hooks/useGlobalState";
import { setModalConfirm } from "../../../store/main/slice";
import { NO_PHOTO } from "../../../utils/constants";

import "./photo.scss";

interface IPhoto {
    src: string;
    alt: string;
    showVisibleIcon?: boolean;
    clickHandler?: () => void;
    deleteHandler?: () => void;
};

// Базовый компонент фотографии
export default memo(function PhotoComponent({ src, alt, showVisibleIcon = true, clickHandler, deleteHandler }: IPhoto) {
    const [visibleCloseIcon, setVisibleCloseIcon] = useState(false);

    const { t } = useTranslation();
    const srcImage = useImage(src);
    const dispatch = useAppDispatch();

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
            dispatch(setModalConfirm({
                text: t("ui.sure_delete_photo"),
                btnActionTitle: t("ui.delete"),
                cb: deleteHandler
            }));

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