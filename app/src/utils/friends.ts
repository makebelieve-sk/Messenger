import { FriendsTab } from "common-types";
import i18next from "i18next";

import useUIStore from "@store/ui";
import { type IFriend } from "@custom-types/friends.types";
import { type IUser } from "@custom-types/models.types";

// Получение объекта дружбы из объекта пользователя
export function getFriendEntity(user: IUser & { createdAt?: string; }): IFriend {
	return {
		id: user.id,
		avatarUrl: user.avatarUrl || "",
		avatarCreateDate: user.avatarCreateDate || "",
		fullName: user.firstName + " " + user.thirdName,
		createdAt: user.createdAt || "",
	};
};

// Возврат текста для пустого списка друзей в зависимости от текущей вкладки раздела
export const getEmptyText = (tab: FriendsTab) => {
	switch (tab) {
	case FriendsTab.MY:
		return i18next.t("friends-module.empty.my_friends");
	case FriendsTab.ONLINE:
		return i18next.t("friends-module.empty.online_friends");
	case FriendsTab.FOLLOWERS:
		return i18next.t("friends-module.empty.followers");
	case FriendsTab.BLOCKED:
		return i18next.t("friends-module.empty.blocked");
	case FriendsTab.OUTGOING_REQUESTS:
		return i18next.t("friends-module.empty.outgoing_requests");
	case FriendsTab.INCOMING_REQUESTS:
		return i18next.t("friends-module.empty.incoming_requests");
	case FriendsTab.SEARCH:
		return i18next.t("friends-module.empty.possible_friends");
	case FriendsTab.COMMON:
		return i18next.t("friends-module.empty.common_friends");
	default:
		useUIStore.getState().setError(i18next.t("friends-module.error.unknown_tab", { tab }));
		return i18next.t("friends-module.empty.my_friends");
	}
};