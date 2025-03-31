import { memo } from "react";
import { useTranslation } from "react-i18next";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { SmallButtonComponent } from "@components/ui/button/smallbutton";

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
            ? <>{t("images-carousel-module.further")} <KeyboardArrowRight /></>
            : <><KeyboardArrowLeft /> {t("images-carousel-module.back")}</>
        }
    </SmallButtonComponent>
});