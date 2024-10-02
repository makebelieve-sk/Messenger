import React from "react";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

interface ICarouselButton {
    next?: boolean;
    isDisabled: boolean;
    handleClick: () => void;
};

export default React.memo(function CarouselButton({ next, isDisabled, handleClick }: ICarouselButton) {
    return <Button size="small" onClick={handleClick} disabled={isDisabled}>
        {next
            ? <>Далее <KeyboardArrowRight /></>
            : <><KeyboardArrowLeft /> Назад</>
        }
    </Button>
});