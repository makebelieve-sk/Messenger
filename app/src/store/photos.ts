import { create } from "zustand";

import { type IPhoto } from "@custom-types/models.types";

interface IPhotosState {
    isPhotosLoading: boolean;
    isAddPhotosLoading: boolean;
    photos: IPhoto[];
    count: number;
	hasMore: boolean;
};

interface IPhotosActions {
    setPhotosLoading: (isPhotosLoading: boolean) => void;
    setAddPhotosLoading: (isAddPhotosLoading: boolean) => void;
	syncPhotos: (photos: { photos: IPhoto[]; count: number; hasMore: boolean; }) => void;
    reset: () => void;
};

// Состояние по умолчанию
const resetState = {
	isPhotosLoading: false,
	isAddPhotosLoading: false,
	photos: [],
	count: 0,
	hasMore: true,
};

// Состояние всех фотографий пользователя
const usePhotosStore = create<IPhotosState & IPhotosActions>(set => ({
	...resetState,

	setPhotosLoading: isPhotosLoading => set({ isPhotosLoading }),
	setAddPhotosLoading: isAddPhotosLoading => set({ isAddPhotosLoading }),
	syncPhotos: ({ photos, count, hasMore }) => set({ photos, count, hasMore }),
	reset: () => set({ ...resetState }),
}));

export default usePhotosStore;