import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import MobileStepper from "@mui/material/MobileStepper";

import PhotoComponent from "../../../ui/Photo";
import Info, { ICarouselImage } from "../../../../modules/ImagesCarousel/Info/Info";
import CarouselButton from "../../../../modules/ImagesCarousel/CarouselButton";
import { useAppDispatch, useAppSelector } from "../../../../hooks/useGlobalState";
import { selectMainState, setImagesInCarousel } from "../../../../store/main/slice";

import "./modal-with-images-carousel.scss";

// Модальное окно с фотографиями и необходимой информации о них в виде карусели
export default function ModalWithImagesCarousel() {
    const [open, setOpen] = useState(false);
    const [activeKey, setActiveKey] = useState(0);
    const [images, setImages] = useState<null | ICarouselImage[]>(null);

    const { imagesInCarousel } = useAppSelector(selectMainState);
    const dispatch = useAppDispatch();

    // Установка активного ключа карусели
    useEffect(() => {
        if (imagesInCarousel) {
            setActiveKey(imagesInCarousel.index);
            setImages(imagesInCarousel.images);
            setOpen(Boolean(imagesInCarousel.images.length));
        } else {
            setOpen(false);
        }
    }, [imagesInCarousel]);

    // Далее
    const handleNext = () => {
        setActiveKey(prevActiveStep => prevActiveStep + 1);
    };

    // Назад
    const handleBack = () => {
        setActiveKey(prevActiveStep => prevActiveStep - 1);
    };

    // Закрытие модального окна
    const onClose = () => {
        setImages(null);
        dispatch(setImagesInCarousel(null));
    };

    return <>
        {open && images
            ? <Info activeImage={images[activeKey]} />
            : null
        }

        <Dialog maxWidth="lg" fullWidth open={open} onClose={onClose} >
            <div className="images-carousel">
                {images && images.length
                    ? <>
                        <PhotoComponent
                            src={images[activeKey].src}
                            alt={images[activeKey].alt}
                            showVisibleIcon={false}
                        />

                        {images.length > 1
                            ? <MobileStepper
                                position="static"
                                steps={images.length}
                                activeStep={activeKey}
                                nextButton={<CarouselButton next isDisabled={activeKey === images.length - 1} handleClick={handleNext} />}
                                backButton={<CarouselButton isDisabled={activeKey === 0} handleClick={handleBack} />}
                            />
                            : null
                        }
                    </>
                    : null
                }
            </div>
        </Dialog>
    </>;
};