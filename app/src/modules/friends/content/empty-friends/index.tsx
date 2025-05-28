import { FriendsTab } from "common-types";
import { useCallback, useMemo } from "react";

import MediumButton from "@components/services/buttons/medium-button";
import i18next from "@service/i18n";
import useFriendsStore from "@store/friends";
import { IS_MY_FRIENDS } from "@utils/constants";
import { getEmptyText } from "@utils/friends";

import "./empty-friends.scss";
import { useParams } from "react-router-dom";
import useProfile from "@hooks/useProfile";

// Компонент для отрисовки пустого списка друзей
export default function EmptyFriends() {
	const { userId } =  useParams();

	const profile = useProfile(userId);

	const currentTab = useFriendsStore(state => state.mainTab === FriendsTab.ALL 
		? state.contentTab 
		: state.mainTab,
	);

	// Показывать кнопку "Найти друзей"
	const showSearchBtn = useMemo(() => {
		return IS_MY_FRIENDS.includes(currentTab) && profile.isMe;
	}, [ currentTab, profile ]);

	// Получение текста при пустом списке друзей текущей вкладки
	const emptyText = useCallback(() => {
		return getEmptyText(currentTab);
	}, [ currentTab ]);

	// Переход на вкладку "Поиск"
	const onChangeTab = () => {
		useFriendsStore.getState().setMainTab(FriendsTab.SEARCH);
	};

	return <div className="empty-friends">
		<div className="opacity-text">
			{emptyText()}
		</div>

		{showSearchBtn
			? <MediumButton
				variant="outlined"
				className="empty-friends__search"
				onClick={onChangeTab}
			>
				{i18next.t("friends-module.actions.find_friends")}
			</MediumButton>
			: null
		}
	</div>;
};