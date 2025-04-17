import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NoDataComponent from "@components/ui/no-data";
import useProfile from "@hooks/useProfile";
import FriendsBlock from "@modules/profile/top-friends/friends-block";
import i18next from "@service/i18n";
import { MainFriendTabs, Pages } from "@custom-types/enums";

// Компонент, отрисовывающий блок друзей
export default memo(function Friends() {
	// TODO заменить loading на загрузку друзей из стора
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [ loading, setLoading ] = useState(false);

	const profile = useProfile();
	const navigate = useNavigate();

	const topFriends = [];
	const friendsCount = 0;

	useEffect(() => {
		// Получаем количество друзей, подписчиков и подгружаем первые 6 из них
		profile.getFriends();
	}, []);

	// Обрабока клика по блоку
	const blockHandler = () => {
		navigate(Pages.friends, {
			state: {
				mainTab: MainFriendTabs.allFriends,
			},
		});
	};

	return <FriendsBlock
		state={{
			title: i18next.t("profile-module.friends"),
			count: friendsCount,
			users: topFriends,
		}}
		isLoading={loading}
		onClickBlock={blockHandler}
	>
		<NoDataComponent text={i18next.t("profile-module.no_friends")} />
	</FriendsBlock>;
});