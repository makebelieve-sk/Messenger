import { create } from "zustand";

import { Pages } from "@custom-types/enums";
import { type IUser } from "@custom-types/models.types";

interface IGlobalState {
    redirectTo: Pages | null;
	onlineUsers: Map<string, IUser>;
};

interface IGlobalActions {
    setRedirectTo: (redirectTo: Pages) => void;
	addOnlineUsers: (onlineUser: IUser) => void;
	setOnlineUsers: (onlineUsers: IUser[]) => void;
	deleteOnlineUser: (userId: string) => void;
    reset: () => void;
};

// Состояние стора для сброса (используется при выходе)
const resetState = {
	redirectTo: Pages.signIn,
	onlineUsers: new Map(),
};

// Состояние глобальных переменных приложения
const useGlobalStore = create<IGlobalState & IGlobalActions>(set => ({
	...resetState,
	redirectTo: null,

	setRedirectTo: redirectTo => set({ redirectTo }),
	addOnlineUsers: onlineUser => set(state => {
		const onlineUsers = new Map(state.onlineUsers);
		onlineUsers.set(onlineUser.id, onlineUser);
		return { onlineUsers };
	}),
	setOnlineUsers: onlineUsers => set(() => {
		const newOnlineUsers = new Map();
		onlineUsers.forEach(user => newOnlineUsers.set(user.id, user));
		return { onlineUsers: newOnlineUsers };
	}),
	deleteOnlineUser: userId => set(state => {
		const onlineUsers = new Map(state.onlineUsers);
		onlineUsers.delete(userId);
		return { onlineUsers };
	}),
	reset: () => set({ ...resetState }),
}));

export default useGlobalStore;