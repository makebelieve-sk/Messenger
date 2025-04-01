import { memo } from "react";
import { useTranslation } from "react-i18next";

import ButtonComponent from "@components/ui/button";
import ArrowRightIconComponent from "@components/icons/arrowRightIcon";
import ArrowLeftIconComponent from "@components/icons/arrowLeftIcon";

interface ICarouselButton {
    next?: boolean;
    isDisabled: boolean;
    handleClick: (dir: number) => void;
};

// Компонент, отвечающий за кнопки "Назад" и "Вперед" в карусели картинок
export default memo(function CarouselButton({ next, isDisabled, handleClick }: ICarouselButton) {
    const { t } = useTranslation();

    // Обработка кнопкок "Назад"/"Вперед"
    const onClick = () => {
        handleClick(next ? 1 : -1);
    }

    return <ButtonComponent size="small" onClick={onClick} disabled={isDisabled}>
        {next
            ? <>{ t("images-carousel-module.further") } <ArrowRightIconComponent size={26} /></>
            : <><ArrowLeftIconComponent size={26} /> { t("images-carousel-module.back") }</>
        }
    </ButtonComponent>
});