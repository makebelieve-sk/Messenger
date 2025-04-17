import Grid from "@mui/material/Grid";

import MainPhoto from "@modules/profile/main-photo";
import PersonalInfo from "@modules/profile/personal-info";
import Photos from "@modules/profile/photos";
import Friends from "@modules/profile/top-friends/friends";
import OnlineFriends from "@modules/profile/top-friends/online-friends";

import "@styles/pages/profile.scss";

// Страница профиля
export default function Profile() {
	return <Grid container spacing={2}>
		<Grid item container xs={4} spacing={2} direction="column">
			{/* Блок моей фотографии */}
			<MainPhoto />

			{/* Блок друзей */}
			<Friends />

			{/* Блок друзей онлайн */}
			<OnlineFriends />
		</Grid>

		<Grid item container xs={8} spacing={2} direction="column">
			{/* Блок личной информации */}
			<PersonalInfo />

			{/* Блок фотографий */}
			<Photos />
		</Grid>
	</Grid>;
}
