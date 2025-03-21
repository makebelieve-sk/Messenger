import { useState, memo } from "react";
import MobileStepper from "@mui/material/MobileStepper";

import { ICarouselData } from "@components/services/modals/carousel";
import PhotoComponent from "@components/ui/photo";
// import Info from "@modules/Сarousel/info";
import CarouselButton from "@modules/Сarousel/button";

import "./carousel.scss";

export interface ICarouselImage {
    src: string;
    authorName: string;
    dateTime: string;
    authorAvatarUrl: string;
    alt: string;
};

// Точка входа в модуль "Карусель картинок"
export default memo(({ data }: { data: ICarouselData; }) => {
    const [activeKey, setActiveKey] = useState(data.index);

    const images = data.images;

    // Обработка кнопкок "Назад"/"Вперед"
    const onHandleClick = (dir: number) => {
        setActiveKey(prevActiveStep => prevActiveStep + dir);
    };

    return <div className="carousel">
        {images && images.length
            ? <>
                <div className="carousel__photo">
                    <PhotoComponent
                        src={images[activeKey].src}
                        alt={images[activeKey].alt}
                        showVisibleIcon={false}
                    />

                    {images.length > 1
                        ? <MobileStepper
                            className="carousel__photo__stepper"
                            position="static"
                            steps={images.length}
                            activeStep={activeKey}
                            nextButton={<CarouselButton next isDisabled={activeKey === images.length - 1} handleClick={onHandleClick} />}
                            backButton={<CarouselButton isDisabled={activeKey === 0} handleClick={onHandleClick} />}
                        />
                        : null
                    }
                </div>
            </>
            : null
        }
    </div>
})