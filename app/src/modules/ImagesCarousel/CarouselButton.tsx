import { memo } from "react";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

interface ICarouselButton {
    next?: boolean;
    isDisabled: boolean;
    handleClick: () => void;
};

export default memo(function CarouselButton({ next, isDisabled, handleClick }: ICarouselButton) {
    const { t } = useTranslation();

    return <Button size="small" onClick={handleClick} disabled={isDisabled}>
        {next
            ? <>{ t("images-carousel-module.further") } <KeyboardArrowRight /></>
            : <><KeyboardArrowLeft /> { t("images-carousel-module.back") }</>
        }
    </Button>
});