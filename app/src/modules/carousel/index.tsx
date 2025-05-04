import { memo } from "react";
import MobileStepper from "@mui/material/MobileStepper";

import PhotoComponent from "@components/ui/photo";
import CarouselButton from "@modules/carousel/button";

import "./carousel.scss";

interface ICarousel {
	image: ICarouselImage;
	activeKey: number;
	allCount: number;
};

export interface ICarouselImage {
	src: string;
	alt: string;
	authorName: string;
	dateTime: string;
	authorAvatarUrl: string;
};

// Точка входа в модуль "Карусель картинок"
export default memo(({ image, activeKey, allCount }: ICarousel) => {
	return <div className="carousel">
		<div className="carousel__photo">
			<PhotoComponent src={image.src} alt={image.alt} showDeleteIcon={false} />

			{allCount > 1
				? <MobileStepper
					className="carousel__photo__stepper"
					variant="text"
					position="static"
					steps={allCount}
					activeStep={activeKey}
					nextButton={<CarouselButton isNext isDisabled={activeKey === allCount - 1} />}
					backButton={<CarouselButton isDisabled={!activeKey} />}
				/>
				: null}
		</div>
	</div>;
});