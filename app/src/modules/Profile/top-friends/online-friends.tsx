import { FriendsTab } from "common-types";
import { memo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import NoDataComponent from "@components/ui/no-data";
import useProfile from "@hooks/useProfile";
import FriendsBlock from "@modules/profile/top-friends/friends-block";
import i18next from "@service/i18n";
import useFriendsStore from "@store/friends";
import { Pages } from "@custom-types/enums";
import { goToAnotherProfile } from "@utils/index";

// Компонент, отрисовывающий блок онлайн друзей
export default memo(function OnlineFriends() {
	const onlineFriends = useFriendsStore(state => state.onlineFriends);
    
	const { userId } = useParams();
	const navigate = useNavigate();

	const profile = useProfile(userId);

	useEffect(() => {
		// Получаем количество друзей, подписчиков и подгружаем первые 6 из них
		profile.getOnlineFriends();
	}, []);

	// Обрабока клика по блоку
	const blockHandler = () => {
		useFriendsStore.getState().setMainTab(FriendsTab.ALL);
		useFriendsStore.getState().setContentTab(FriendsTab.ONLINE);

		navigate(goToAnotherProfile(Pages.friends, userId));
	};

	return <FriendsBlock
		state={{
			title: i18next.t("profile-module.friends_online"),
			count: onlineFriends.length,
			friends: onlineFriends,
		}}
		onClickBlock={blockHandler}
	>
		<NoDataComponent text={i18next.t("profile-module.no_online_friends")} />
	</FriendsBlock>;
});