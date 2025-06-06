import { type StoreApi } from "zustand";

import type { IPhoto } from "@custom-types/models.types";

interface IPhotosState {
  photos: IPhoto[];
  isPhotosLoading: boolean;
  isAddPhotosLoading: boolean;
  hasMore: boolean;
  count: number;
}

interface IPhotosActions {
  setPhotosLoading: (isLoading: boolean) => void;
  setAddPhotosLoading: (isLoading: boolean) => void;
  syncPhotos: (data: { photos: IPhoto[]; count: number; hasMore: boolean; }) => void;
  reset: () => void;
  getAllPhotos: () => void;
  getState: () => IPhotosState & IPhotosActions;
}

const mockPhotosStore: IPhotosState & IPhotosActions = {
	photos: [],
	isPhotosLoading: false,
	isAddPhotosLoading: false,
	hasMore: true,
	count: 0,
	setPhotosLoading: jest.fn(),
	setAddPhotosLoading: jest.fn(),
	syncPhotos: jest.fn(),
	reset: jest.fn(),
	getAllPhotos: jest.fn(),
	getState: () => mockPhotosStore,
};

const usePhotosStore = jest.fn((selector) => selector(mockPhotosStore)) as unknown as StoreApi<IPhotosState & IPhotosActions>;
usePhotosStore.getState = () => mockPhotosStore;

export default usePhotosStore; 