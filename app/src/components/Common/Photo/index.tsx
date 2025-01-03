import React from "react";
import CloseIcon from "@mui/icons-material/Close";

import useImage from "../../../hooks/useImage";
import { useAppDispatch } from "../../../hooks/useGlobalState";
import { setModalConfirm } from "../../../state/main/slice";
import { NO_PHOTO } from "../../../utils/constants";

import "./photo.scss";

interface IPhoto {
    src: string;
    alt: string;
    showVisibleIcon?: boolean;
    clickHandler?: () => void;
    deleteHandler?: (setLoading?: React.Dispatch<React.SetStateAction<boolean>>) => void;
};

export default React.memo(function Photo({ src, alt, showVisibleIcon = true, clickHandler, deleteHandler }: IPhoto) {
    const [visibleCloseIcon, setVisibleCloseIcon] = React.useState(false);

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
                text: "Вы действительно хотите удалить эту фотографию?",
                btnActionTitle: "Удалить",
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