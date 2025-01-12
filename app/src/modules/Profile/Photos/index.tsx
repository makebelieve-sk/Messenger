import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import PhotoComponent from "../../../components/ui/Photo";
import InputImageComponent from "../../../components/ui/InputImage";
import NoDataComponent from "../../../components/ui/NoData";
import SpinnerComponent from "../../../components/ui/Spinner";
import LinkComponent from "../../../components/ui/Link";
import { useAppSelector } from "../../../hooks/useGlobalState";
import useProfile from "../../../hooks/useProfile";
import { selectUserState } from "../../../store/user/slice";
import { Pages } from "../../../types/enums";
import { getFullName } from "../../../utils";

import "./photos.scss";

export default memo(function Photos() {
	const [loadingPhotos, setLoadingPhotos] = useState(false);
	const [loadingBtn, setLoadingBtn] = useState(false);

	const profile = useProfile();

	const { t } = useTranslation();
	const { user, photos } = useAppSelector(selectUserState);
	const navigate = useNavigate();

	// Получаем все фотографии пользователя
	useEffect(() => {
		profile.getAllPhotos(setLoadingPhotos);
	}, []);

	// Обновляем счетчик фотографий
	useEffect(() => {
		profile.updatePhotosCount(photos.length);
	}, [photos]);

	// Клик по одной из своих фотографий
	const onClickPhoto = (index: number) => {
		profile.onClickPhoto(photos, index);
	};

	// Добавление новых фотографий
	const addPhotosHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const fileList = e.target.files;

		if (fileList && fileList.length && user) {
			const formData = new FormData();
			const files = Array.from(fileList);

			files.forEach((file) => {
				formData.append("photo", file);
			});

			profile.addPhotos(formData, setLoadingBtn);
		}
	};

	// Удаление одной фотографии
	const deleteOnePhoto = (photoPath: string) => {
		profile.deletePhoto(
			{ fileUrl: photoPath, isAvatar: false },
			photos,
			photoPath
		);
	};

	return (
		<Grid item>
			<Paper className="photo-container paper-block">
				<div className="photo-container__title">
					<div className="block-title photo-container__title__text">
						{ t("profile-module.my_photos") }
						<span className="counter">{photos.length}</span>
					</div>

					<LinkComponent
						variant="body2"
						onClick={() => navigate(Pages.photos)}
						underline="hover"
						className="photo-container__title__link"
					>
						{ t("profile-module.watch_all") }
					</LinkComponent>
				</div>

				{
					loadingPhotos 
				    	? <SpinnerComponent />
						: photos && photos.length 
							? <div className="photo-container__photos">
								{photos.slice(0, 3).map((photo, index) => {
									return <PhotoComponent
										key={photo.id}
										src={photo.path}
										alt={getFullName(user) + " " + index}
										clickHandler={() => onClickPhoto(index)}
										deleteHandler={() =>
											deleteOnePhoto(photo.path)
										}
									/>
								})}
							</div>
							: <NoDataComponent text={t("profile-module.no_photos")} />
				}

				<InputImageComponent
					id="add-new-photos"
					text={t("profile-module.add_more")}
					loading={loadingBtn}
					multiple
					onChange={addPhotosHandler}
				/>
			</Paper>
		</Grid>
	);
});