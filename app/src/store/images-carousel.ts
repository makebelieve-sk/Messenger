import { create } from "zustand";

interface IImagesCarouselState {
	isAvatar:  boolean;
    photoIndex: number | null;
};

interface IImagesCarouselActions {
	setAvatar: (isAvatar: boolean) => void;
	setIndex: (photoIndex: number) => void;
    changeIndex: (dir: 1 | -1) => void;
    reset: () => void;
};

// Состояние стора для сброса (используется при выходе)
const resetState = {
	isAvatar: false,
	photoIndex: null,
};

// Состояние карусели фотографий приложения
const useImagesCarouselStore = create<IImagesCarouselState & IImagesCarouselActions>(set => ({
	...resetState,

	setAvatar: isAvatar => set({ isAvatar }),
	setIndex: photoIndex => set({ photoIndex }),
	changeIndex: dir => set(state => ({ photoIndex: (state.photoIndex as number) + dir })),
	reset: () => set({ ...resetState }),
}));

export default useImagesCarouselStore;