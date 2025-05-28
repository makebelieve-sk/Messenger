import { FriendsTab } from "common-types";
import { memo, type RefObject, type SyntheticEvent } from "react";
import Badge from "@mui/material/Badge";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import { type VirtualListHandle } from "@modules/virtual-list/list";
import i18next from "@service/i18n";
import useFriendsStore from "@store/friends";

import "./tabs.scss";
import useUser from "@hooks/useUser";

interface IMainTabs {
    virtualRef: RefObject<VirtualListHandle | null>;
};

// Основные вкладки страницы "Друзья"
export default memo(function MainTabs({ virtualRef }: IMainTabs) {
	const mainTab = useFriendsStore(state => state.mainTab);

	const friendsNotification = useFriendsStore(state => state.friendsNotification);

	const countOutgoingRequests = useFriendsStore(state => state.countOutgoingRequests);
	const countIncomingRequests = useFriendsStore(state => state.countIncomingRequests);
	const countSearchFriends = useFriendsStore(state => state.countSearchFriends);

	const friendsService = useUser().friendsService;

	const incomingRequestsLabel = friendsNotification
		? <Badge color="primary" badgeContent=" " variant="dot">{i18next.t("friends-module.friend_requests")}</Badge>
		: `${i18next.t("friends-module.friend_requests")} ${countIncomingRequests}`;

	// Изменение основных вкладок
	const onChangeTab = (_: SyntheticEvent<Element, Event>, newValue: number) => {
		virtualRef.current?.scrollTop("instant");
		useFriendsStore.getState().setMainTab(newValue);
		// Обнуляем строку поиска возможных друзей при изменении вкладки
		friendsService.search(FriendsTab.SEARCH, "");
	};

	return <Tabs
		orientation="vertical"
		centered={false}
		value={mainTab}
		onChange={onChangeTab}
		aria-label="main-tabs"
	>
		<Tab
			key={FriendsTab.ALL}
			label={i18next.t("friends-module.all_friends")}
			value={FriendsTab.ALL}
			id="all-friends"
			aria-controls="all-friends"
			className="main-tabs__tab label-tab"
		/>
		<Tab
			key={FriendsTab.INCOMING_REQUESTS}
			label={incomingRequestsLabel}
			value={FriendsTab.INCOMING_REQUESTS}
			id="incoming-requests"
			aria-controls="incoming-requests"
			className="main-tabs__tab label-tab"
		/>
		<Tab
			key={FriendsTab.OUTGOING_REQUESTS}
			label={`${i18next.t("friends-module.outgoing_requests")} ${countOutgoingRequests}`}
			value={FriendsTab.OUTGOING_REQUESTS}
			id="outgoing-requests"
			aria-controls="outgoing-requests"
			className="main-tabs__tab label-tab"
		/>
		<Tab
			key={FriendsTab.SEARCH}
			label={`${i18next.t("friends-module.search")} ${countSearchFriends}`}
			value={FriendsTab.SEARCH}
			id="search"
			aria-controls="search"
			className="main-tabs__tab label-tab"
		/>
	</Tabs>;
});