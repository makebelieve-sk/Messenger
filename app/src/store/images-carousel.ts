import { create } from "zustand";

import { type ICarouselImage } from "@modules/carousel";

interface IImagesCarouselState {
    index: number;
    images: ICarouselImage[] | null;
};

interface IImagesCarouselActions {
    changeIndex: (dir: 1 | -1) => void;
    setImagesCarousel: (data: { images: ICarouselImage[]; index: number; }) => void;
    resetImages: () => void;
    reset: () => void;
};

// Состояние стора для сброса (используется при выходе)
const resetState = {
	index: 0,
	images: null,
};

// Состояние карусели картинок приложения
const useImagesCarouselStore = create<IImagesCarouselState & IImagesCarouselActions>(set => ({
	...resetState,

	changeIndex: dir => set(state => ({ index: state.index + dir })),
	setImagesCarousel: ({ images, index }) => set({ images, index }),
	resetImages: () => set({ images: null }),
	reset: () => set({ ...resetState }),
}));

export default useImagesCarouselStore;