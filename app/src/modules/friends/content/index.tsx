import { FriendsTab } from "common-types";
import { type RefObject, type SyntheticEvent, useEffect } from "react";
import { Tab, Tabs } from "@mui/material";

import useUser from "@hooks/useUser";
import { type VirtualListHandle } from "@modules/virtual-list/list";
import i18next from "@service/i18n";
import useFriendsStore from "@store/friends";
import FriendsList from "./friends-list";

import "./friends.scss";
import { useParams } from "react-router-dom";
import useProfile from "@hooks/useProfile";

interface IContent {
	virtualRef: RefObject<VirtualListHandle | null>;
};

// Основной контент страницы "Друзья" выбранной вкладки
export default function Content({ virtualRef }: IContent) {
	const showTabs = useFriendsStore(state => state.mainTab === FriendsTab.ALL);
	const currentTab = useFriendsStore(state => state.mainTab === FriendsTab.ALL
		? state.contentTab
		: state.mainTab,
	);

	const countMyFriends = useFriendsStore(state => state.countMyFriends);
	const countOnlineFriends = useFriendsStore(state => state.countOnlineFriends);
	const countFollowers = useFriendsStore(state => state.countFollowers);
	const countBlockedFriends = useFriendsStore(state => state.countBlockedFriends);
	const countCommonFriends = useFriendsStore(state => state.countCommonFriends);

	const { userId } = useParams();
	const profile = useProfile(userId);
	const friendsService = useUser(userId).friendsService;

	const myFriendsTabLabel = profile.isMe
		? `${i18next.t("friends-module.my_friends")} ${countMyFriends}`
		: `${i18next.t("friends-module.all_friends")} ${countMyFriends}`;

	// Получение друзей согласно текущей открытой вкладке только один раз (состояние в глобальном состоянии синхронизировано)
	useEffect(() => {
		friendsService.getFriends(currentTab);
	}, [currentTab]);

	// Изменение вкладки контента
	const onChangeTab = (_: SyntheticEvent<Element, Event>, newValue: number) => {
		virtualRef.current?.scrollTop("instant");
		useFriendsStore.getState().setContentTab(newValue);
	};

	return <div className="content">
		{showTabs
			? <Tabs
				centered={false}
				value={currentTab}
				onChange={onChangeTab}
				aria-label="content-tabs"
			>
				<Tab
					key={FriendsTab.MY}
					label={myFriendsTabLabel}
					value={FriendsTab.MY}
					id="my-friends"
					aria-controls="my-friends"
					className="content__tab label-tab"
				/>
				<Tab
					key={FriendsTab.ONLINE}
					label={`${i18next.t("friends-module.online_friends")} ${countOnlineFriends}`}
					value={FriendsTab.ONLINE}
					id="online-friends"
					aria-controls="online-friends"
					className="content__tab label-tab"
				/>
				<Tab
					key={FriendsTab.FOLLOWERS}
					label={`${i18next.t("friends-module.followers")} ${countFollowers}`}
					value={FriendsTab.FOLLOWERS}
					id="followers"
					aria-controls="followers"
					className="content__tab label-tab"
				/>
				{profile.isMe
					? <Tab
						key={FriendsTab.BLOCKED}
						label={`${i18next.t("friends-module.blocked")} ${countBlockedFriends}`}
						value={FriendsTab.BLOCKED}
						id="blocked"
						aria-controls="blocked"
						className="content__tab label-tab"
					/>
					: <Tab
						key={FriendsTab.COMMON}
						label={`${i18next.t("friends-module.common_friends")} ${countCommonFriends}`}
						value={FriendsTab.COMMON}
						id="common"
						aria-controls="common"
						className="content__tab label-tab"
					/>
				}
			</Tabs>
			: null
		}

		<FriendsList virtualRef={virtualRef} />
	</div>;
};