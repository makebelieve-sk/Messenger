import { FriendsTab } from "common-types";
import { type StoreApi } from "zustand";

import { IFriend } from "@custom-types/friends.types";

export interface IFriendsState {
    onlineFriends: IFriend[];
    mainTab: FriendsTab;
    contentTab: FriendsTab;
    countMyFriends: number;
    countFollowers: number;
    friendsNotification: number;
}

export interface IFriendsActions {
    setMainTab: (tab: FriendsTab) => void;
    setContentTab: (tab: FriendsTab) => void;
    getState: () => IFriendsState & IFriendsActions;
    reset: () => void;
}

const initialState = {
	onlineFriends: [],
	mainTab: FriendsTab.MY,
	contentTab: FriendsTab.MY,
	countMyFriends: 0,
	countFollowers: 0,
	friendsNotification: 0,
};

export const mockFriendsStore: IFriendsState & IFriendsActions = {
	...initialState,
	setMainTab: jest.fn(),
	setContentTab: jest.fn(),
	getState: () => mockFriendsStore,
	reset: jest.fn(),
};

const useFriendsStore = jest.fn((selector) => selector(mockFriendsStore)) as unknown as StoreApi<IFriendsState & IFriendsActions>;
useFriendsStore.getState = () => mockFriendsStore;

export default useFriendsStore; 