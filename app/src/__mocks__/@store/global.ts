import { type StoreApi } from "zustand";

import { Pages } from "@custom-types/enums";
import { type IUser } from "@custom-types/models.types";

interface GlobalStore {
	redirectTo: Pages;
	onlineUsers: Set<string>;
	setRedirectTo: (page: Pages) => void;
	addOnlineUsers: (users: IUser[]) => void;
	setOnlineUsers: (users: IUser[]) => void;
	deleteOnlineUser: (userId: string) => void;
	reset: () => void;
	getState: () => GlobalStore;
}

const mockGlobalStore: GlobalStore = {
	redirectTo: Pages.signIn,
	onlineUsers: new Set<string>(),
	setRedirectTo: jest.fn(),
	addOnlineUsers: jest.fn(),
	setOnlineUsers: jest.fn(),
	deleteOnlineUser: jest.fn(),
	reset: jest.fn(),
	getState: () => mockGlobalStore,
};

const useGlobalStore = jest.fn((selector) => selector(mockGlobalStore)) as unknown as StoreApi<GlobalStore> & {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	mockImplementation: (fn: (selector: (state: GlobalStore) => any) => any) => void;
};
useGlobalStore.getState = () => mockGlobalStore;

export default useGlobalStore;
