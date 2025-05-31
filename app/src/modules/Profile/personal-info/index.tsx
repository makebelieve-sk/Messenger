import { FriendsTab } from "common-types";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import GridComponent from "@components/ui/grid";
import PaperComponent from "@components/ui/paper";
import SpinnerComponent from "@components/ui/spinner";
import useProfile from "@hooks/useProfile";
import useUserDetails from "@hooks/useUserDetails";
import i18next from "@service/i18n";
import useFriendsStore from "@store/friends";
import usePhotosStore from "@store/photos";
import useUserStore from "@store/user";
import { Pages } from "@custom-types/enums";
import { goToAnotherProfile } from "@utils/index";

import "./personal-info.scss";

// Компонент отвечающий за персональную информацию пользователя
export default function PersonalInfo() {
	const fullName = useUserStore(state => state.user.fullName);
	const birthday = useUserStore(state => state.userDetails.birthday);
	const city = useUserStore(state => state.userDetails.city);
	const work = useUserStore(state => state.userDetails.work);

	const myFriendsCount = useFriendsStore(state => state.countMyFriends);
	const followersCount = useFriendsStore(state => state.countFollowers);

	const navigate = useNavigate();
	const { userId } = useParams();

	const photosCount = usePhotosStore(state => state.count);
	const isPhotosLoading = usePhotosStore(state => state.isPhotosLoading);

	const profile = useProfile(userId);
	const userDetails = useUserDetails(userId);

	useEffect(() => {
		profile.userService.syncInfo();
	}, [ userId ]);

	// Обработка клика по блоку
	const onClickBlock = (tab: FriendsTab) => {
		useFriendsStore.getState().setMainTab(FriendsTab.ALL);
		useFriendsStore.getState().setContentTab(tab);

		navigate(goToAnotherProfile(Pages.friends, userId));
	};

	// Обработка клика по блоку фотографий
	const onClickPhotos = () => {
		navigate(goToAnotherProfile(Pages.photos, userId));
	};

	return <GridComponent>
		<PaperComponent className="info-container paper-block">
			<div className="info-container__main-info">
				<div className="info-container__username">{fullName}</div>
			</div>

			<div className="info-container__short-info-block">
				{profile.isMe
					? <div className="info-container__short-info-block__edit" onClick={() => navigate(Pages.edit)}>
						{i18next.t("profile-module.edit")}
					</div>
					: null
				}

				<div className="info-container__short-info-block__row">
					<div className="info-container__short-info-block__row__title">{i18next.t("profile-module.birthday")}:</div>
					<span className="info-container__short-info-block__row__value">{birthday}</span>
				</div>

				<div className="info-container__short-info-block__row">
					<div className="info-container__short-info-block__row__title">{i18next.t("profile-module.city")}:</div>
					<span className="info-container__short-info-block__row__value">{city}</span>
				</div>

				<div className="info-container__short-info-block__row">
					<div className="info-container__short-info-block__row__title">{i18next.t("profile-module.work")}:</div>
					<span className="info-container__short-info-block__row__value">{work}</span>
				</div>
			</div>

			<div className="info-container__counts-block">
				<div
					className="info-container__counts-block__count"
					onClick={() => onClickBlock(FriendsTab.MY)}
				>
					<span className="info-container__counts-block__count__value">{myFriendsCount}</span> {userDetails.getFriendsText(myFriendsCount)}
				</div>

				<div
					className="info-container__counts-block__count"
					onClick={() => onClickBlock(FriendsTab.FOLLOWERS)}
				>
					<span className="info-container__counts-block__count__value">{followersCount}</span> {userDetails.getSubscribersText(followersCount)}
				</div>

				<div className="info-container__counts-block__count" onClick={onClickPhotos}>
					{isPhotosLoading
						? <SpinnerComponent />
						: <>
							<span className="info-container__counts-block__count__value">{photosCount}</span> {userDetails.getPhotosText(photosCount)}
						</>
					}
				</div>

				<div className="info-container__counts-block__count">
					<span className="info-container__counts-block__count__value">0</span> {userDetails.getAudiosText(0)}
				</div>

				<div className="info-container__counts-block__count">
					<span className="info-container__counts-block__count__value">0</span> {userDetails.getVideosText(0)}
				</div>
			</div>
		</PaperComponent>
	</GridComponent>;
};