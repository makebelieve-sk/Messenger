import { memo, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

import ChangeAvatarComponent, { type IUpdatedAvatar } from "@components/ui/change-avatar";
import PhotoComponent from "@components/ui/photo";
import i18next from "@service/i18n";
import useAuthStore from "@store/auth";
import { AVATAR_URL } from "@utils/constants";

import "./sign-up.scss";

interface IChooseAvatar {
	username: string;
	avatarUrl: string;
	onChange: (field: string, value: string, validateCallback?: (value: string) => string, anotherField?: string) => void;
	onChangeAvatar: (field: string, updatedAvatar: IUpdatedAvatar) => void;
};

// Компонент, отвечающий за выбор аватара на странице регистрации
export default memo(function ChooseAvatar({ username, avatarUrl, onChange, onChangeAvatar }: IChooseAvatar) {
	const [ avatarLetters, setAvatarLetters ] = useState("");

	const loading = useAuthStore(state => state.chooseAvatarLoading);

	useEffect(() => {
		if (username) {
			setAvatarLetters(username.split(" ").map((str) => str[0]).join(""));
		}
	}, [ username ]);

	// Удаление аватара
	const deleteAvatar = () => {
		onChange(AVATAR_URL, "");
	};

	// Изменение своей аватарки
	const changeAvatar = (updatedAvatar: IUpdatedAvatar) => {
		onChangeAvatar(AVATAR_URL, updatedAvatar);
	};

	const setLoading = (isLoading: boolean) => {
		useAuthStore.getState().setChooseAvatarLoading(isLoading);
	};

	return <Box className="choose-avatar">
		<Grid container spacing={2} className="choose-avatar__container">
			<Grid item xs={8}>
				<Typography className="choose-avatar__container__main-text">
					{username}, {i18next.t("profile-module.how_like_avatar")}
				</Typography>
			</Grid>

			<Grid item xs={8} className="choose-avatar__container__avatar-wrapper">
				{loading 
					? <Skeleton variant="rectangular" className="choose-avatar__container__avatar-loading" />
					: avatarUrl 
						? <div className="choose-avatar__container__avatar">
							<PhotoComponent src={avatarUrl} alt="user-avatar" deleteHandler={deleteAvatar} />
						</div>
						: <div className="choose-avatar__container__avatar-without-user">
							{avatarLetters}
						</div>
				}
			</Grid>

			<Grid item xs={8} className="choose-avatar__container__change-photo">
				<ChangeAvatarComponent 
					labelText={i18next.t("profile-module.choose_another_photo")} 
					loading={loading} 
					onChange={changeAvatar}
					setLoading={setLoading}
				/>
			</Grid>
		</Grid>
	</Box>;
});
