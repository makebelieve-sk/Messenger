import { memo, useEffect, useState } from "react";

import useUser from "@hooks/useUser";
import useUserIdFromPath from "@hooks/useUserIdOutsideRoute";
import CarouselModule, { type ICarouselImage } from "@modules/carousel";
import useImagesCarouselStore from "@store/images-carousel";

const THRESHOLD_LOADING_COUNT = 5;

// Отрисовка фотографий пользователя в карусели
export default memo(function PhotosCarousel() {
	const [ carouselPhoto, setCarouselPhoto ] = useState<ICarouselImage | null>(null);

	const activeKey = useImagesCarouselStore(state => state.photoIndex);

	const userId = useUserIdFromPath();
	const user = useUser(userId);
	const photosService = user.photosService;

	// Ищем выбранную фотографию по её id в списке всех фотографий пользователя.
	useEffect(() => {
		if (activeKey !== null) {
			const foundPhoto = photosService.photos[activeKey];

			if (!foundPhoto) {
				setCarouselPhoto(null);
				return;
			}

			setCarouselPhoto({
				src: foundPhoto.path,
				alt: foundPhoto.id,
				authorName: user.fullName,
				authorAvatarUrl: user.avatarUrl,
				dateTime: foundPhoto.createdAt,
			});

			/**
			 * Если текущая фотография является в списке последних THRESHOLD_LOADING_COUNT фото, то подгружаем следующие фотографии.
			 * -1 отнимаем, потому что массив фотографий же считается с 0, а не с 1.
			 */
			if (photosService.photos.length - activeKey - 1 <= THRESHOLD_LOADING_COUNT) {
				photosService.getAllPhotos();
			}
		}
	}, [ activeKey, user, photosService ]);

	if (!carouselPhoto || activeKey === null) return null;

	return <CarouselModule
		image={carouselPhoto}
		activeKey={activeKey}
		allCount={photosService.count}
	/>;
});