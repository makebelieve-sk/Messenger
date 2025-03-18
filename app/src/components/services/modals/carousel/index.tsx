import { useState, useEffect } from "react";

import CommonModal from "@components/services/modals/common-modal";
import CarouselModule, { ICarouselImage } from "@modules/carousel";
import eventBus from "@utils/event-bus";
import { GlobalEvents } from "@custom-types/events";

const modalTitle = "modal-carousel-title";
const modalDescription = "modal-carousel-description";

export interface ICarouselData {
    images: ICarouselImage[];
    index: number;
};

// Модальное окно с фотографиями и необходимой информации о них в виде карусели
export default function ModalWithImagesCarousel() {
    const [open, setOpen] = useState(false);
    const [modalData, setModalData] = useState<ICarouselData>();

    useEffect(() => {
        // После установки картинок необходимо обновить состояние для корректного показа модального окна
        eventBus.on(GlobalEvents.SET_IMAGES_CAROUSEL, onSetImagesCarousel);

        // Отписываемся от данного события при размонтировании, чтобы избежать утечки памяти
        return () => {
            eventBus.off(GlobalEvents.SET_IMAGES_CAROUSEL, onSetImagesCarousel);
        }
    }, []);

    // Обработчик события SET_IMAGES_CAROUSEL
    const onSetImagesCarousel = (data: ICarouselData) => {
        setOpen(Boolean(data));
        setModalData(data);
    };

    // Закрытие модального окна
    const onClose = () => {
        setOpen(false);
    };

    if (!open || !modalData) {
        return null;
    }

    return (
        <CommonModal data={modalData} isOpen={open} onClose={onClose} title={modalTitle} description={modalDescription}>
            <CarouselModule data={modalData} />
        </CommonModal>
    )
};