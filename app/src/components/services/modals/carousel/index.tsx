import AvatarCarousel from "@components/services/carousels/avatar-carousel";
import PhotosCarousel from "@components/services/carousels/photos-carousel";
import ModalComponent from "@components/ui/modal";
// import Info from "@modules/carousel/info";
import useImagesCarouselStore from "@store/images-carousel";

const MODAL_TITLE = "modal-carousel-title";
const MODAL_DESCRIPTION = "modal-carousel-description";

// Модальное окно с фотографиями и необходимой информации о них в виде карусели
export default function ModalWithImagesCarousel() {
	const { isAvatar, photoIndex } = useImagesCarouselStore(state => state);

	// Закрытие модального окна
	const onClose = () => {
		useImagesCarouselStore.getState().reset();
	};

	if (!isAvatar && (photoIndex === null || photoIndex < 0)) return null;

	return <ModalComponent
		open
		onClose={onClose}
		title={MODAL_TITLE}
		description={MODAL_DESCRIPTION}
		// extraContent={<Info activeImage={images[index]} />}
	>
		{isAvatar && <AvatarCarousel />}
		{photoIndex !== null && photoIndex > -1 && <PhotosCarousel />}
	</ModalComponent>;
};