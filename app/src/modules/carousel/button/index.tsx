import { memo } from "react";

import ArrowLeftIconComponent from "@components/icons/arrow-left";
import ArrowRightIconComponent from "@components/icons/arrow-right";
import { SmallButtonComponent } from "@components/services/buttons/small-button";
import i18n from "@service/i18n";
import useImagesCarouselStore from "@store/images-carousel";

interface ICarouselButton {
	next?: boolean;
	isDisabled: boolean;
};

// Компонент, отвечающий за кнопки "Назад" и "Вперед" в карусели картинок
export default memo(function CarouselButton({ next, isDisabled }: ICarouselButton) {
	// Обработка кнопок "Назад"/"Вперед"
	const onClick = () => {
		useImagesCarouselStore.getState().changeIndex(next ? 1 : -1);
	};

	return <SmallButtonComponent onClick={onClick} disabled={isDisabled}>
		{next
			? <>
				{i18n.t("images-carousel-module.further")} <ArrowRightIconComponent />
			</>
			: <>
				<ArrowLeftIconComponent /> {i18n.t("images-carousel-module.back")}
			</>
		}
	</SmallButtonComponent>;
});
