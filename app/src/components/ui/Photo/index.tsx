import { memo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CloseIconComponent from "@components/icons/close";
import useImage from "@hooks/useImage";
import useProfile from "@hooks/useProfile";
import i18next from "@service/i18n";
import useUIStore from "@store/ui";
import { NO_PHOTO } from "@utils/constants";

import "./photo.scss";

interface IPhotoComponent {
	src: string;
	alt: string;
	showDeleteIcon?: boolean;
	isLazy?: boolean;
	clickHandler?: () => void;
	deleteHandler?: () => void;
};

// Базовый компонент фотографии
export default memo(function PhotoComponent({ 
	src, 
	alt, 
	showDeleteIcon = true, 
	isLazy = false, 
	clickHandler, 
	deleteHandler, 
}: IPhotoComponent) {
	const [ neverShowCloseIcon, setNeverShowCloseIcon ] = useState(false);
	const [ visibleCloseIcon, setVisibleCloseIcon ] = useState(false);

	const { userId } = useParams();

	const srcImage = useImage(src);
	const profile = useProfile(userId);

	// Если текущий профиль не мой, то скрываем кнопку удаления
	useEffect(() => {
		if (!profile.isMe) {
			setNeverShowCloseIcon(true);
		}
	}, [ userId ]);

	// Клик по изображению
	const onClick = () => {
		if (clickHandler) clickHandler();
	};

	// Обработка наведения на изображение
	const onMouseOver = () => {
		if (!neverShowCloseIcon && showDeleteIcon && src && src !== NO_PHOTO) setVisibleCloseIcon(true);
	};

	// Обработка ухода курсора с изображения
	const onMouseOut = () => {
		if (!neverShowCloseIcon && showDeleteIcon && src && src !== NO_PHOTO) setVisibleCloseIcon(false);
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
			? <div className="photo__close-icon" onClick={onDelete} data-testid="close-icon">
				<CloseIconComponent size="16" />
			</div>
			: null
		}

		<img src={srcImage} alt={alt} className="photo__image" loading={isLazy ? "lazy" : "eager"} data-testid="image" />
	</div>;
});