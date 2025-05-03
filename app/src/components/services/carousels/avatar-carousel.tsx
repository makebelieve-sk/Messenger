import { memo, useEffect, useState } from "react";

import useUser from "@hooks/useUser";
import CarouselModule, { type ICarouselImage } from "@modules/carousel";

// Отрисовка аватара пользователя в карусели
export default memo(function AvatarCarousel() {
	const [ carouselPhoto, setCarouselPhoto ] = useState<ICarouselImage | null>(null);

	const user = useUser();

	useEffect(() => {
		setCarouselPhoto({
			src: user.avatarUrl,
			alt: user.id,
			authorName: user.fullName,
			authorAvatarUrl: user.avatarUrl,
			dateTime: user.avatarCreateDate,
		});
	}, []);

	if (!carouselPhoto) return null;

	return <CarouselModule
		image={carouselPhoto}
		activeKey={0}
		allCount={1}
	/>;
});