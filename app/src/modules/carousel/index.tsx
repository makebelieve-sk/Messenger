import { memo } from "react";
import MobileStepper from "@mui/material/MobileStepper";

import PhotoComponent from "@components/ui/photo";
import CarouselButton from "@modules/carousel/button";
import Info from "@modules/carousel/info";
import useImagesCarouselStore from "@store/images-carousel";

import "./carousel.scss";

export interface ICarouselImage {
	src: string;
	authorName: string;
	dateTime: string;
	authorAvatarUrl: string;
	alt: string;
};

// Точка входа в модуль "Карусель картинок"
export default memo(({ images }: { images: ICarouselImage[]; }) => {
	const activeKey = useImagesCarouselStore(state => state.index);

	return <div className="carousel">
		<div className="carousel__info">
			<Info activeImage={images[activeKey]} />
		</div>

		<div className="carousel__photo">
			<PhotoComponent src={images[activeKey].src} alt={images[activeKey].alt} showVisibleIcon={false} />

			{images.length > 1 
				? <MobileStepper
					className="carousel__photo__stepper"
					position="static"
					steps={images.length}
					activeStep={activeKey}
					nextButton={<CarouselButton next isDisabled={activeKey === images.length - 1} />}
					backButton={<CarouselButton isDisabled={!activeKey} />}
				/>
				: null}
		</div>
	</div>;
});
