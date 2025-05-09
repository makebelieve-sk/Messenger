import { FriendsTab } from "common-types";
import { useNavigate } from "react-router-dom";

import GridComponent from "@components/ui/grid";
import PaperComponent from "@components/ui/paper";
import SpinnerComponent from "@components/ui/spinner";
import useUserDetails from "@hooks/useUserDetails";
import i18next from "@service/i18n";
import usePhotosStore from "@store/photos";
import useUserStore from "@store/user";
import { MainFriendTabs, Pages } from "@custom-types/enums";

import "./personal-info.scss";

// Компонент отвечающий за персональную информацию пользователя
export default function PersonalInfo() {
	const fullName = useUserStore(state => state.user.fullName);
	const birthday = useUserStore(state => state.userDetails.birthday);
	const city = useUserStore(state => state.userDetails.city);
	const work = useUserStore(state => state.userDetails.work);

	const photosCount = usePhotosStore(state => state.count);
	const isPhotosLoading = usePhotosStore(state => state.isPhotosLoading);

	const userDetails = useUserDetails();
	const navigate = useNavigate();

	// Обработка клика по блоку
	const onClickBlock = (tab?: FriendsTab) => {
		const stateOptions: { mainTab: MainFriendTabs; tab?: FriendsTab; } = {
			mainTab: MainFriendTabs.allFriends,
		};

		if (tab) {
			stateOptions.tab = tab;
		}

		navigate(Pages.friends, { state: stateOptions });
	};

	return <GridComponent>
		<PaperComponent className="info-container paper-block">
			<div className="info-container__main-info">
				<div className="info-container__username">{fullName}</div>
			</div>

			<div className="info-container__short-info-block">
				<div className="info-container__short-info-block__edit" onClick={() => navigate(Pages.edit)}>
					{i18next.t("profile-module.edit")}
				</div>

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
					onClick={() => onClickBlock()}
				>
					<span className="info-container__counts-block__count__value">{0}</span> {userDetails.getFriendsText(0)}
				</div>

				<div
					className="info-container__counts-block__count"
					onClick={() => onClickBlock(FriendsTab.subscribers)}
				>
					<span className="info-container__counts-block__count__value">{0}</span> {userDetails.getSubscribersText(0)}
				</div>

				<div className="info-container__counts-block__count" onClick={() => navigate(Pages.photos)}>
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