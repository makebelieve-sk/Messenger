import { create } from "zustand";

import type { IUser, IUserDetails } from "@custom-types/models.types";

type EditUserDetailsType = Omit<IUserDetails, "userId" | "lastSeen">;

interface IUserState {
    user: IUser;
    isUserLoading: boolean;
    userDetails: IUserDetails;
	editUserDetails: EditUserDetailsType;
};

interface IUserActions {
    setUser: (user: IUser) => void;
    setLoadingUser: (isUserLoading: boolean) => void;
    setUserDetails: (data: { userDetails: IUserDetails; editUserDetails: EditUserDetailsType; }) => void;
    reset: () => void;
};

// Состояние по умолчанию
const resetState = {
	user: null as never,
	isUserLoading: false,
	userDetails: null as never,
	editUserDetails: null as never,
};

// Состояние всех данных пользователя
const useUserStore = create<IUserState & IUserActions>(set => ({
	...resetState,
	isUserLoading: true,

	setUser: user => set({ user }),
	setLoadingUser: isUserLoading => set({ isUserLoading }),
	setUserDetails: ({ userDetails, editUserDetails }) => set({ userDetails, editUserDetails }),
	reset: () => set({ ...resetState }),
}));

export default useUserStore;