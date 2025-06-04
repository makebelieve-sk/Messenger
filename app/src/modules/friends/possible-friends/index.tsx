import { FriendsTab } from "common-types";
import { memo, type RefObject, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import CircularProgress from "@mui/material/CircularProgress";

import BigUserAvatar from "@components/services/avatars/big-user-avatar";
import ListComponent from "@components/ui/list";
import ListItemComponent from "@components/ui/list-item";
import ListItemAvatarComponent from "@components/ui/list-item-avatar";
import ListItemTextComponent from "@components/ui/list-item-text";
import SpinnerComponent from "@components/ui/spinner";
import useUser from "@hooks/useUser";
import { type VirtualListHandle } from "@modules/virtual-list/list";
import i18next from "@service/i18n";
import useFriendsStore from "@store/friends";

import "./possible-friends.scss";

interface IPossibleFriends{
    virtualRef: RefObject<VirtualListHandle | null>;
};

// Список "Возможные друзья"
export default memo(function PossibleFriends({ virtualRef }: IPossibleFriends) {
	const friendsService = useUser().friendsService;

	const possibleFriends = useFriendsStore(state => state.searchFriends);
	const isLoading = useFriendsStore(state => state.isLoadingPossibleFriends);
	const isLoadingFollowAction = useFriendsStore(state => state.isLoadingFollowAction);

	// Получение возможных друзей при загрузке страницы
	useEffect(() => {
		friendsService.getFriends(FriendsTab.SEARCH);
	}, []);

	// Подписка на пользователя
	const onAddUser = (friendId: string) => {
		friendsService.followFriend(friendId);
	};

	// Обработка клика по заголовку, переход на вкладку "Поиск"
	const onChangeMainTab = () => {
		virtualRef.current?.scrollTop("instant");
		useFriendsStore.getState().setMainTab(FriendsTab.SEARCH);
	};

	return <>
		<div className="block-title" onClick={onChangeMainTab}>{i18next.t("friends-module.possible_friends")}</div>

		<div className="possible-container__block" data-testid="possible-friends-container">
			{isLoading && (!possibleFriends || !possibleFriends.length)
				? <div className="possible-container__loading">
					<SpinnerComponent />
				</div>
				: possibleFriends && possibleFriends.length
					? <ListComponent className="possible-container__list">
						{possibleFriends.slice(0, 5).map(possibleFriend => {
							return <ListItemComponent className="possible-container__item" key={possibleFriend.id} disablePadding>
								<ListItemAvatarComponent className="possible-container__item-avatar">
									<BigUserAvatar
										userId={possibleFriend.id}
										src={possibleFriend.avatarUrl}
										alt={possibleFriend.fullName}
									/>
								</ListItemAvatarComponent>

								<ListItemTextComponent
									className="possible-container__item-block"
									primary={possibleFriend.fullName}
									secondary={
										<span
											className="possible-container__action"
											onClick={_ => onAddUser(possibleFriend.id)}
										>
											<AddIcon className="possible-container__action-icon" />

											<span className="possible-container__action-text">
												{isLoadingFollowAction
													? <CircularProgress />
													: i18next.t("friends-module.add_to_friends")
												}
											</span>
										</span>
									}
								/>
							</ListItemComponent>;
						})}
					</ListComponent>
					: <div className="opacity-text">
						{i18next.t("friends-module.no_other_users")}
					</div>
			}
		</div>
	</>;
});