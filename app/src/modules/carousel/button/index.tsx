import { memo } from "react";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Button from "@mui/material/Button";

import i18next from "@service/i18n";
import useImagesCarouselStore from "@store/images-carousel";

interface ICarouselButton {
	next?: boolean;
	isDisabled: boolean;
};

// Компонент, отвечающий за кнопки "Назад" и "Вперед" в карусели картинок
export default memo(function CarouselButton({ next, isDisabled }: ICarouselButton) {
	// Обработка кнопкок "Назад"/"Вперед"
	const onClick = () => {
		useImagesCarouselStore.getState().changeIndex(next ? 1 : -1);
	};

	return <Button size="small" onClick={onClick} disabled={isDisabled}>
		{next 
			? <>
				{i18next.t("images-carousel-module.further")} <KeyboardArrowRight />
			</> 
			: <>
				<KeyboardArrowLeft /> {i18next.t("images-carousel-module.back")}
			</>
		}
	</Button>;
});
