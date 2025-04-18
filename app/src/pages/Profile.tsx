import GridComponent from "@components/ui/grid";
import MainPhoto from "@modules/profile/main-photo";
import PersonalInfo from "@modules/profile/personal-info";
import Photos from "@modules/profile/photos";
import Friends from "@modules/profile/top-friends/friends";
import OnlineFriends from "@modules/profile/top-friends/online-friends";

import "@styles/pages/profile.scss";

// Страница профиля
export default function Profile() {
	return <GridComponent container spacing={2}>
		<GridComponent container xs={4} spacing={2}>
			{/* Блок моей фотографии */}
			<MainPhoto />

			{/* Блок друзей */}
			<Friends />

			{/* Блок друзей онлайн */}
			<OnlineFriends />
		</GridComponent>

		<GridComponent container xs={8} spacing={2}>
			{/* Блок личной информации */}
			<PersonalInfo />

			{/* Блок фотографий */}
			<Photos />
		</GridComponent>
	</GridComponent>;
}
