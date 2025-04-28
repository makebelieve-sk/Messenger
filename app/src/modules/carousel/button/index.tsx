import { memo } from "react";
import { useTranslation } from "react-i18next";

import ArrowLeftIconComponent from "@components/icons/arrowLeftIcon";
import ArrowRightIconComponent from "@components/icons/arrowRightIcon";
import { SmallButtonComponent } from "@components/ui/button/small-button";

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

    return <SmallButtonComponent onClick={onClick} disabled={isDisabled}>
        {next
            ? <>{t("images-carousel-module.further")} <ArrowRightIconComponent /></>
            : <><ArrowLeftIconComponent /> {t("images-carousel-module.back")}</>
        }
    </SmallButtonComponent>
});