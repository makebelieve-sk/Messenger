import { type StoreApi } from "zustand";

import { Pages } from "@custom-types/enums";
import { type IUser } from "@custom-types/models.types";

interface GlobalStore {
	redirectTo: Pages;
	onlineUsers: Map<string, IUser>;
	setRedirectTo: (page: Pages) => void;
	addOnlineUsers: (users: IUser[]) => void;
	setOnlineUsers: (users: IUser[]) => void;
	deleteOnlineUser: (userId: string) => void;
	reset: () => void;
	getState: () => GlobalStore;
}

const mockGlobalStore: GlobalStore = {
	redirectTo: Pages.signIn,
	onlineUsers: new Map<string, IUser>(),
	setRedirectTo: jest.fn(),
	addOnlineUsers: jest.fn(),
	setOnlineUsers: jest.fn(),
	deleteOnlineUser: jest.fn(),
	reset: jest.fn(),
	getState: () => mockGlobalStore,
};

const useGlobalStore = jest.fn((selector) => selector(mockGlobalStore)) as unknown as StoreApi<GlobalStore>;
useGlobalStore.getState = () => mockGlobalStore;

export default useGlobalStore;
