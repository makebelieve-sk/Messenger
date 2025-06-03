import { type StoreApi } from "zustand";

interface ImagesCarouselStore {
  isAvatar: boolean;
  photoIndex: number | null;
  reset: () => void;
  getState: () => ImagesCarouselStore;
  setIndex: (index: number) => void;
  changeIndex: (index: number) => void;
  setAvatar: (isAvatar: boolean) => void;
}

const mockImagesCarouselStore: ImagesCarouselStore = {
	isAvatar: false,
	photoIndex: null,
	reset: jest.fn(),
	getState: () => mockImagesCarouselStore,
	setIndex: jest.fn(),
	changeIndex: jest.fn(),
	setAvatar: jest.fn(),
};

const useImagesCarouselStore = jest.fn((selector) => selector(mockImagesCarouselStore)) as unknown as StoreApi<ImagesCarouselStore>;
useImagesCarouselStore.getState = () => mockImagesCarouselStore;

export default useImagesCarouselStore; 