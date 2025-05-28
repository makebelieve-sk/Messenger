import { FriendsTab } from "common-types";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import GridComponent from "@components/ui/grid";
import PaperComponent from "@components/ui/paper";
import Content from "@modules/friends/content";
import PossibleFriends from "@modules/friends/possible-friends";
import MainTabs from "@modules/friends/tabs";
import { type VirtualListHandle } from "@modules/virtual-list/list";
import useFriendsStore from "@store/friends";
import LinkComponent from "@components/ui/link";

import "@styles/pages/friends.scss";
import useProfile from "@hooks/useProfile";
import BigUserAvatar from "@components/services/avatars/big-user-avatar";
import { Pages } from "@custom-types/enums";
import { goToAnotherProfile } from "@utils/index";
import usePrepareAnotherUser from "@hooks/usePrepareAnotherUser";
import SpinnerComponent from "@components/ui/spinner";
import useUser from "@hooks/useUser";

// Страница "Друзья"
export default function Friends() {
	const virtualRef = useRef<VirtualListHandle | null>(null);

	const { userId } = useParams();
	const navigate = useNavigate();

	const { isLoading: isLoadingAnotherUser, isExistProfile } = usePrepareAnotherUser();

	const mainTab = useFriendsStore(state => state.mainTab);
	const profile = useProfile(isLoadingAnotherUser || !isExistProfile ? undefined : userId);
	const user = useUser(isLoadingAnotherUser || !isExistProfile ? undefined : userId);
	const friendsService = user.friendsService;

	// Получение друзей при загрузке страницы
	useEffect(() => {
		friendsService.getFriends(FriendsTab.MY);
	}, [userId]);

	// Обработка перехода на чужой профиль
	const onClickAnotherUser = () => {
		navigate(goToAnotherProfile(Pages.profile, userId));
	};

	// При первом входе на страницу по урлу другого пользователя, показываем спиннер, пока ждем его подгрузки и создание его профиля
	if (isLoadingAnotherUser || !isExistProfile) {
		return <div className="user-profile-page-spinner">
			<SpinnerComponent />
		</div>;
	}

	return <GridComponent container spacing={2} className="friends-container">
		<GridComponent xs={8} className="friends-container__content">
			<PaperComponent className="paper-block friends-container__content__wrapper">
				<Content virtualRef={virtualRef} />
			</PaperComponent>
		</GridComponent>

		<GridComponent xs={4} direction="column" spacing={2}>
			<GridComponent container spacing={2}>
				<GridComponent>
					<PaperComponent className="paper-block">
						{profile.isMe
							? <MainTabs virtualRef={virtualRef} />
							: <div className="friends-container__another-user">
								<BigUserAvatar
									userId={user.id}
									src={user.avatarUrl}
									alt={user.fullName}
								/>

								<div className="friends-container__another-user__info">
									{user.fullName}

									<LinkComponent
										variant="body2"
										onClick={onClickAnotherUser}
										underline="hover"
										className="friends-container__another-user__info__link"
									>
										Перейти к странице
									</LinkComponent>
								</div>
							</div>
						}
					</PaperComponent>
				</GridComponent>

				{mainTab === FriendsTab.SEARCH || !profile.isMe
					? null
					: <GridComponent className="friends-container__possible-friends">
						<PaperComponent className="paper-block">
							<PossibleFriends virtualRef={virtualRef} />
						</PaperComponent>
					</GridComponent>
				}
			</GridComponent>
		</GridComponent>
	</GridComponent>;
};