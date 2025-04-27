import ModalComponent from "@components/ui/modal";
import CarouselModule from "@modules/carousel";
import Info from "@modules/carousel/info";
import useImagesCarouselStore from "@store/images-carousel";

const MODAL_TITLE = "modal-carousel-title";
const MODAL_DESCRIPTION = "modal-carousel-description";

// Модальное окно с фотографиями и необходимой информации о них в виде карусели
export default function ModalWithImagesCarousel() {
	const { images, index } = useImagesCarouselStore(state => state);

	// Закрытие модального окна
	const onClose = () => {
		useImagesCarouselStore.getState().resetImages();
	};

	if (!images) return null;

	return <ModalComponent
		open
		onClose={onClose}
		title={MODAL_TITLE}
		description={MODAL_DESCRIPTION}
		extraContent={<Info activeImage={images[index]} />}
	>
		<CarouselModule images={images} />
	</ModalComponent>;
}
