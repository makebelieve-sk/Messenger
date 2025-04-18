import { memo, useState } from "react";

import CloseIconComponent from "@components/icons/closeIcon";
import useImage from "@hooks/useImage";
import i18next from "@service/i18n";
import useUIStore from "@store/ui";
import { NO_PHOTO } from "@utils/constants";

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
	const [ visibleCloseIcon, setVisibleCloseIcon ] = useState(false);

	const srcImage = useImage(src);

	// Клик по изображению
	const onClick = () => {
		if (clickHandler) clickHandler();
	};

	// Обработка наведения на изображение
	const onMouseOver = () => {
		if (showVisibleIcon && src && src !== NO_PHOTO) setVisibleCloseIcon(true);
	};

	// Обработка ухода курсора с изображения
	const onMouseOut = () => {
		if (showVisibleIcon && src && src !== NO_PHOTO) setVisibleCloseIcon(false);
	};

	// Удаление изображения
	const onDelete = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
		if (visibleCloseIcon && deleteHandler) {
			useUIStore.getState().setConfirmModal({
				text: i18next.t("ui.sure_delete_photo"),
				btnActionTitle: i18next.t("ui.delete"),
				cb: deleteHandler,
			});

			// Останавливаем всплытие события
			event.stopPropagation();
		}
	};

	return <div className="photo" onClick={onClick} onMouseEnter={onMouseOver} onMouseLeave={onMouseOut}>
		{visibleCloseIcon 
			? <div className="photo__close-icon" onClick={onDelete}>
				<CloseIconComponent size="16" />
			</div>
			: null
		}

		<img src={srcImage} alt={alt} className="photo__image" />
	</div>;
});
