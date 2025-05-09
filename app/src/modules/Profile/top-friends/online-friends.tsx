import { FriendsTab } from "common-types";
import { memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import NoDataComponent from "@components/ui/no-data";
import useProfile from "@hooks/useProfile";
import FriendsBlock from "@modules/profile/top-friends/friends-block";
import i18next from "@service/i18n";
import useGlobalStore from "@store/global";
import { MainFriendTabs, Pages } from "@custom-types/enums";

// Компонент, отрисовывающий блок онлайн друзей
export default memo(function OnlineFriends() {
	const onlineUsers = useGlobalStore(state => state.onlineUsers);
    
	const profile = useProfile();
	const navigate = useNavigate();

	useEffect(() => {
		// Получаем количество друзей, подписчиков и подгружаем первые 6 из них
		profile.getFriends();
	}, []);

	// Обрабока клика по блоку
	const blockHandler = () => {
		navigate(Pages.friends, {
			state: {
				mainTab: MainFriendTabs.allFriends,
				tab: FriendsTab.online,
			},
		});
	};

	return <FriendsBlock
		state={{
			title: i18next.t("profile-module.friends_online"),
			count: onlineUsers.size,
			users: Array.from(onlineUsers.values()).slice(0, 6),
		}}
		onClickBlock={blockHandler}
	>
		<NoDataComponent text={i18next.t("profile-module.no_online_friends")} />
	</FriendsBlock>;
});