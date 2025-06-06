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

// Компонент, отрисовывающий блок друзей
export default memo(function Friends() {
	const friends = useFriendsStore(state => state.myFriends);
	const count = useFriendsStore(state => state.countMyFriends);
	const isLoading = useFriendsStore(state => state.isLoadingMyFriends);

	const { userId } = useParams();
	const navigate = useNavigate();

	const profile = useProfile(userId);

	useEffect(() => {
		// Получаем количество друзей и подписчиков
		profile.getFriendsAndFollowers();
	}, []);

	// Обрабока клика по блоку
	const blockHandler = () => {
		useFriendsStore.getState().setMainTab(FriendsTab.ALL);
		useFriendsStore.getState().setContentTab(FriendsTab.MY);

		navigate(goToAnotherProfile(Pages.friends, userId));
	};

	return <FriendsBlock
		state={{
			title: i18next.t("profile-module.friends"),
			count: count,
			friends: friends,
		}}
		isLoading={isLoading}
		onClickBlock={blockHandler}
	>
		<NoDataComponent text={i18next.t("profile-module.no_friends")} />
	</FriendsBlock>;
});