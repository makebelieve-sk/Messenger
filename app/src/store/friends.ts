import { FriendsTab } from "common-types";
import { create } from "zustand";

import { type IFriend } from "@custom-types/friends.types";

export interface IGetAllCounts {
    countSearchFriends: number;
    countIncomingRequests: number;
    countOutgoingRequests: number;
    countMyFriends: number;
    countFollowers: number;
    countBlockedFriends: number;
	countCommonFriends: number;
};

interface IFriendsState {
    mainTab: FriendsTab;
    contentTab: FriendsTab;
    friendsNotification: number;

    searchFriends: IFriend[];
    countSearchFriends: number;
    hasMoreSearchFriends: boolean;
    isLoadingPossibleFriends: boolean;
    isLoadingFollowAction: boolean;
    searchPossibleFriends: string;

    incomingRequests: IFriend[];
    countIncomingRequests: number;
    hasMoreIncomingRequests: boolean;
    isLoadingIncomingRequests: boolean;
    isLoadingLeftInFollowersAction: boolean;
    isLoadingAcceptAction: boolean;
    searchIncomingRequests: string;

    outgoingRequests: IFriend[];
    countOutgoingRequests: number;
    hasMoreOutgoingRequests: boolean;
    isLoadingOutgoingRequests: boolean;
    isLoadingUnfollowAction: boolean;
    searchOutgoingRequests: string;

    myFriends: IFriend[];
    countMyFriends: number;
    hasMoreMyFriends: boolean;
    isLoadingMyFriends: boolean;
    isLoadingDeleteFriendAction: boolean;
    isLoadingBlockFriendAction: boolean;
    searchMyFriends: string;

    onlineFriends: IFriend[];
    countOnlineFriends: number;
    hasMoreOnlineFriends: boolean;
    isLoadingOnlineFriends: boolean;
    searchOnlineFriends: string;

    followers: IFriend[];
    countFollowers: number;
    hasMoreFollowers: boolean;
    isLoadingFollowers: boolean;
    isLoadingAddFriendAction: boolean;
    searchFollowers: string;

    blockedFriends: IFriend[];
    countBlockedFriends: number;
    hasMoreBlockedFriends: boolean;
    isLoadingBlockedFriends: boolean;
    isLoadingUnblockAction: boolean;
    searchBlockedFriends: string;

	commonFriends: IFriend[];
	isLoadingCommonFriends: boolean;
	searchCommonFriends: string;
	countCommonFriends: number;
	hasMoreCommonFriends: boolean;
};

interface IFriendsActions {
    setMainTab: (mainTab: FriendsTab) => void;
    setContentTab: (contentTab: FriendsTab) => void;
    setFriendsNotification: (friendsNotification: number) => void;
    setAllCounts: (data: IGetAllCounts) => void;

    setPossibleFriends: ({ items, count, hasMore }: { items: IFriend[]; count: number; hasMore: boolean; }) => void;
    setIsLoadingPossibleFriends: (isLoadingPossibleFriends: boolean) => void;
    setIsLoadingFollowAction: (isLoadingFollowAction: boolean) => void;
    setSearchPossibleFriends: (searchPossibleFriends: string) => void;

    setIncomingRequests: ({ items, count, hasMore }: { items: IFriend[]; count: number; hasMore: boolean; }) => void;
    setIsLoadingIncomingRequests: (isLoadingIncomingRequests: boolean) => void;
    setIsLoadingLeftInFollowersAction: (isLoadingLeftInFollowersAction: boolean) => void;
    setIsLoadingAcceptAction: (isLoadingAcceptAction: boolean) => void;
    setSearchIncomingRequests: (searchIncomingRequests: string) => void;
	addFriendsNotification: () => void;
	removeFriendsNotification: () => void;

    setOutgoingRequests: ({ items, count, hasMore }: { items: IFriend[]; count: number; hasMore: boolean; }) => void;
    setIsLoadingOutgoingRequests: (isLoadingOutgoingRequests: boolean) => void;
    setIsLoadingUnfollowAction: (isLoadingUnfollowAction: boolean) => void;
    setSearchOutgoingRequests: (searchOutgoingRequests: string) => void;

    setFollowers: ({ items, count, hasMore }: { items: IFriend[]; count: number; hasMore: boolean; }) => void;
    setIsLoadingFollowers: (isLoadingFollowers: boolean) => void;
    setIsLoadingAddFriendAction: (isLoadingAddFriendAction: boolean) => void;
    setSearchFollowers: (searchFollowers: string) => void;

    setMyFriends: ({ items, count, hasMore }: { items: IFriend[]; count: number; hasMore: boolean; }) => void;
    setIsLoadingMyFriends: (isLoadingMyFriends: boolean) => void;
    setIsLoadingDeleteFriendAction: (isLoadingDeleteFriendAction: boolean) => void;
    setIsLoadingBlockFriendAction: (isLoadingBlockFriendAction: boolean) => void;
    setSearchMyFriends: (searchMyFriends: string) => void;

    setBlockedFriends: ({ items, count, hasMore }: { items: IFriend[]; count: number; hasMore: boolean; }) => void;
    setIsLoadingBlockFriends: (isLoadingBlockFriends: boolean) => void;
    setIsLoadingUnblockAction: (isLoadingUnblockAction: boolean) => void;
    setSearchBlockedFriends: (searchBlockedFriends: string) => void;

	setCommonFriends: ({ items, count, hasMore }: { items: IFriend[]; count: number; hasMore: boolean; }) => void;
	setIsLoadingCommonFriends: (isLoadingCommonFriends: boolean) => void;
	setSearchCommonFriends: (searchCommonFriends: string) => void;

	setOnlineFriends: ({ items, count, hasMore }: { items: IFriend[]; count: number; hasMore: boolean; }) => void;
	setIsLoadingOnlineFriends: (isLoadingOnlineFriends: boolean) => void;
    setSearchOnlineFriends: (searchOnlineFriends: string) => void;

    reset: () => void;
};

// Состояние стора для сброса (используется при выходе)
const resetState = {
	mainTab: FriendsTab.ALL,
	contentTab: FriendsTab.MY,
	friendsNotification: 0,

	searchFriends: [],
	countSearchFriends: 0,
	hasMoreSearchFriends: false,
	isLoadingPossibleFriends: false,
	isLoadingFollowAction: false,
	searchPossibleFriends: "",

	incomingRequests: [],
	countIncomingRequests: 0,
	hasMoreIncomingRequests: false,
	isLoadingIncomingRequests: false,
	isLoadingLeftInFollowersAction: false,
	isLoadingAcceptAction: false,
	searchIncomingRequests: "",

	outgoingRequests: [],
	countOutgoingRequests: 0,
	hasMoreOutgoingRequests: false,
	isLoadingOutgoingRequests: false,
	isLoadingUnfollowAction: false,
	searchOutgoingRequests: "",

	myFriends: [],
	countMyFriends: 0,
	hasMoreMyFriends: false,
	isLoadingMyFriends: false,
	isLoadingDeleteFriendAction: false,
	isLoadingBlockFriendAction: false,
	searchMyFriends: "",

	onlineFriends: [],
	countOnlineFriends: 0,
	hasMoreOnlineFriends: false,
	isLoadingOnlineFriends: false,
	searchOnlineFriends: "",

	followers: [],
	countFollowers: 0,
	hasMoreFollowers: false,
	isLoadingFollowers: false,
	isLoadingAddFriendAction: false,
	searchFollowers: "",

	blockedFriends: [],
	countBlockedFriends: 0,
	hasMoreBlockedFriends: false,
	isLoadingBlockedFriends: false,
	isLoadingUnblockAction: false,
	searchBlockedFriends: "",

	commonFriends: [],
	isLoadingCommonFriends: false,
	searchCommonFriends: "",
	countCommonFriends: 0,
	hasMoreCommonFriends: false,
};

// Состояние "Друзья"
const useFriendsStore = create<IFriendsState & IFriendsActions>(set => ({
	...resetState,

	setMainTab: mainTab => set({ mainTab }),
	setContentTab: contentTab => set({ contentTab }),
	setFriendsNotification: friendsNotification => set({ friendsNotification }),
	setAllCounts: data => set({
		countSearchFriends: data.countSearchFriends,
		countIncomingRequests: data.countIncomingRequests,
		countOutgoingRequests: data.countOutgoingRequests,
		countMyFriends: data.countMyFriends,
		countFollowers: data.countFollowers,
		countBlockedFriends: data.countBlockedFriends,
		countCommonFriends: data.countCommonFriends
	}),

	setPossibleFriends: ({ items, count, hasMore }) => set({ searchFriends: items, countSearchFriends: count, hasMoreSearchFriends: hasMore }),
	setIsLoadingPossibleFriends: isLoadingPossibleFriends => set({ isLoadingPossibleFriends }),
	setIsLoadingFollowAction: isLoadingFollowAction => set({ isLoadingFollowAction }),
	setSearchPossibleFriends: searchPossibleFriends => set({ searchPossibleFriends }),

	setIncomingRequests: ({ items, count, hasMore }) => set({ incomingRequests: items, countIncomingRequests: count, hasMoreIncomingRequests: hasMore }),
	setIsLoadingIncomingRequests: isLoadingIncomingRequests => set({ isLoadingIncomingRequests }),
	setIsLoadingLeftInFollowersAction: isLoadingLeftInFollowersAction => set({ isLoadingLeftInFollowersAction }),
	setIsLoadingAcceptAction: isLoadingAcceptAction => set({ isLoadingAcceptAction }),
	setSearchIncomingRequests: searchIncomingRequests => set({ searchIncomingRequests }),
	addFriendsNotification: () => set(state => ({ friendsNotification: state.friendsNotification + 1 })),
	removeFriendsNotification: () => set(state => ({ 
		friendsNotification: state.friendsNotification 
			? state.friendsNotification - 1 
			: state.friendsNotification 
	})),

	setOutgoingRequests: ({ items, count, hasMore }) => set({ outgoingRequests: items, countOutgoingRequests: count, hasMoreOutgoingRequests: hasMore }),
	setIsLoadingOutgoingRequests: isLoadingOutgoingRequests => set({ isLoadingOutgoingRequests }),
	setIsLoadingUnfollowAction: isLoadingUnfollowAction => set({ isLoadingUnfollowAction }),
	setSearchOutgoingRequests: searchOutgoingRequests => set({ searchOutgoingRequests }),

	setFollowers: ({ items, count, hasMore }) => set({ followers: items, countFollowers: count, hasMoreFollowers: hasMore }),
	setIsLoadingFollowers: isLoadingFollowers => set({ isLoadingFollowers }),
	setIsLoadingAddFriendAction: isLoadingAddFriendAction => set({ isLoadingAddFriendAction }),
	setSearchFollowers: searchFollowers => set({ searchFollowers }),

	setMyFriends: ({ items, count, hasMore }) => set({ myFriends: items, countMyFriends: count, hasMoreMyFriends: hasMore }),
	setIsLoadingMyFriends: isLoadingMyFriends => set({ isLoadingMyFriends }),
	setIsLoadingDeleteFriendAction: isLoadingDeleteFriendAction => set({ isLoadingDeleteFriendAction }),
	setIsLoadingBlockFriendAction: isLoadingBlockFriendAction => set({ isLoadingBlockFriendAction }),
	setSearchMyFriends: searchMyFriends => set({ searchMyFriends }),

	setBlockedFriends: ({ items, count, hasMore }) => set({ blockedFriends: items, countBlockedFriends: count, hasMoreBlockedFriends: hasMore }),
	setIsLoadingBlockFriends: isLoadingBlockFriends => set({ isLoadingBlockedFriends: isLoadingBlockFriends }),
	setIsLoadingUnblockAction: isLoadingUnblockAction => set({ isLoadingUnblockAction }),
	setSearchBlockedFriends: searchBlockedFriends => set({ searchBlockedFriends }),

	setCommonFriends: ({ items, count, hasMore }) => set({ commonFriends: items, countCommonFriends: count, hasMoreCommonFriends: hasMore }),
	setIsLoadingCommonFriends: isLoadingCommonFriends => set({ isLoadingCommonFriends }),
	setSearchCommonFriends: searchCommonFriends => set({ searchCommonFriends }),

	setOnlineFriends: ({ items, count, hasMore }) => set({ onlineFriends: items, countOnlineFriends: count, hasMoreOnlineFriends: hasMore }),
	setIsLoadingOnlineFriends: isLoadingOnlineFriends => set({ isLoadingOnlineFriends }),
	setSearchOnlineFriends: searchOnlineFriends => set({ searchOnlineFriends }),

	reset: () => set({ ...resetState }),
}));

export default useFriendsStore;