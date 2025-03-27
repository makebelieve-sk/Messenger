import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import useUser from "@hooks/useUser";
import useUserDetails from "@hooks/useUserDetails";
import { useAppSelector } from "@hooks/useGlobalState";
import { selectFriendState } from "@store/friend/slice";
import { selectUserState } from "@store/user/slice";
import { FriendsTab, MainFriendTabs, Pages } from "@custom-types/enums";

import { onClickBlockType } from "@modules/profile/friends";
import GridComponent from "@components/ui/Grid";
import SpinnerComponent from "@components/ui/spinner";
import { UserDetailsEvents } from "@custom-types/events";
import PaperComponent from "@components/ui/Paper";

import "./personal-info.scss";

interface IPersonalInfo {
	onClickBlock: onClickBlockType;
}

export default memo(function PersonalInfo({ onClickBlock }: IPersonalInfo) {
	const [loading, setLoading] = useState(false);

	const { photosCount } = useAppSelector(selectUserState);
	const { friendsCount, subscribersCount } =
		useAppSelector(selectFriendState);

	const { t } = useTranslation();
	const { fullName } = useUser();
	const userDetails = useUserDetails();
	const navigate = useNavigate();

	const handleOnLoading = (isLoading: boolean) => setLoading(isLoading);

	// Подписка на событие лоадинг
	useEffect(() => {
		userDetails.on(UserDetailsEvents.SET_LOADING, handleOnLoading);

		return () => {
			userDetails.off(UserDetailsEvents.SET_LOADING, handleOnLoading);
		};
	}, []);

	return <GridComponent className="info-container__grid">
		<PaperComponent className="info-container paper-block">
			<div className="info-container__main-info">
				<div className="info-container__username">{fullName}</div>
			</div>

			<div className="info-container__short-info-block">
				<div
					className="info-container__short-info-block__edit"
					onClick={() => navigate(Pages.edit)}
				>
					{t("profile-module.edit")}
				</div>

				{loading
					? <SpinnerComponent />
					: <>
						<div className="info-container__short-info-block__row">
							<div className="info-container__short-info-block__row__title">
								{t("profile-module.birthday")}:
							</div>
							<span>{userDetails.birthday}</span>
						</div>

						<div className="info-container__short-info-block__row">
							<div className="info-container__short-info-block__row__title">
								{t("profile-module.city")}:
							</div>
							<span>{userDetails.city}</span>
						</div>

						<div className="info-container__short-info-block__row">
							<div className="info-container__short-info-block__row__title">
								{t("profile-module.work")}:
							</div>
							<span>{userDetails.work}</span>
						</div>
					</>
				}
			</div>

			<div className="info-container__counts-block">
				<div
					className="counts-block__count"
					onClick={() =>
						onClickBlock(Pages.friends, {
							mainTab: MainFriendTabs.allFriends,
						})
					}
				>
					<span>{friendsCount}</span>{" "}
					{userDetails.getFriendsText(friendsCount)}
				</div>

				<div
					className="counts-block__count"
					onClick={() =>
						onClickBlock(Pages.friends, {
							mainTab: MainFriendTabs.allFriends,
							tab: FriendsTab.subscribers,
						})
					}
				>
					<span>{subscribersCount}</span>{" "}
					{userDetails.getSubscribersText(subscribersCount)}
				</div>

				<div
					className="counts-block__count"
					onClick={() => navigate(Pages.photos)}
				>
					<span>{photosCount}</span>{" "}
					{userDetails.getPhotosText(photosCount)}
				</div>

				<div className="counts-block__count">
					<span>0</span> {userDetails.getAudiosText(0)}
				</div>

				<div className="counts-block__count">
					<span>0</span> {userDetails.getVideosText(0)}
				</div>
			</div>
		</PaperComponent>
	</GridComponent>
});
