import { type StoreApi } from "zustand";

import type { IUser, IUserDetails } from "@custom-types/models.types";

export interface UserStore {
  user: IUser | null;
  isUserLoading: boolean;
  userDetails: IUserDetails | null;
  editUserDetails: IUserDetails | null;
  myAvatar: { userId: string; src: string; alt: string } | null;
  setUser: (user: IUser) => void;
  setLoadingUser: (isLoading: boolean) => void;
  setUserDetails: (details: IUserDetails) => void;
  setMyAvatar: (avatar: { userId: string; src: string; alt: string } | null) => void;
  reset: () => void;
  getState: () => UserStore;
};

const mockUserStore: UserStore = {
	user: null,
	isUserLoading: false,
	userDetails: null,
	editUserDetails: null,
	myAvatar: {
		userId: "123",
		src: "avatar.jpg",
		alt: "User Avatar",
	},
	setUser: jest.fn(),
	setLoadingUser: jest.fn(),
	setUserDetails: jest.fn(),
	setMyAvatar: jest.fn(),
	reset: jest.fn(),
	getState: () => mockUserStore,
};

const useUserStore = jest.fn((selector) => selector(mockUserStore)) as unknown as StoreApi<UserStore>;
useUserStore.getState = () => mockUserStore;

export default useUserStore;