import CommonModal from "@components/services/modals/common-modal";
import CarouselModule from "@modules/carousel";
import useImagesCarouselStore from "@store/images-carousel";

const MODAL_TITLE = "modal-carousel-title";
const MODAL_DESCRIPTION = "modal-carousel-description";

// Модальное окно с фотографиями и необходимой информации о них в виде карусели
export default function ModalWithImagesCarousel() {
	const images = useImagesCarouselStore(state => state.images);

	// Закрытие модального окна
	const onClose = () => {
		useImagesCarouselStore.getState().resetImages();
	};

	if (!images) return null;

	return <CommonModal isOpen onClose={onClose} title={MODAL_TITLE} description={MODAL_DESCRIPTION}>
		<CarouselModule images={images} />
	</CommonModal>;
}
