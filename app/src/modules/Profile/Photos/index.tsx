import { ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import GridComponent from "@components/ui/grid";
import InputImageComponent from "@components/ui/input-image";
import LinkComponent from "@components/ui/link";
import NoDataComponent from "@components/ui/no-data";
import PaperComponent from "@components/ui/paper";
import PhotoComponent from "@components/ui/photo";
import SpinnerComponent from "@components/ui/spinner";
import useProfile from "@hooks/useProfile";
import i18next from "@service/i18n";
import usePhotosStore from "@store/photos";
import { Pages } from "@custom-types/enums";
import { IPhoto } from "@custom-types/models.types";

import "./photos.scss";

// Компонент отрисовки блока фотографий на странице профиля
export default function Photos() {
	const isPhotosLoading = usePhotosStore(state => state.isPhotosLoading);
	const isAddPhotosLoading = usePhotosStore(state => state.isAddPhotosLoading);
	const photos = usePhotosStore(state => state.photos);
	const photosCount = usePhotosStore(state => state.count);

	const profile = useProfile();
	const navigate = useNavigate();

	// Загружаем первую страницу фотографий
	useEffect(() => {
		profile.photosService.getAllPhotos();
	}, []);

	// Клик по одной из своих фотографий
	const onClickPhoto = (index: number) => {
		profile.onClickPhoto(photos, index);
	};

	// Добавление новых фотографий
	const addPhotosHandler = async (e: ChangeEvent<HTMLInputElement>) => {
		const fileList = e.target.files;

		if (fileList && fileList.length) {
			const formData = new FormData();
			const files = Array.from(fileList);

			files.forEach((file) => {
				formData.append("photo", file);
			});

			profile.photosService.addPhotos(formData);
		}
	};

	// Удаление одной фотографии
	const deleteOnePhoto = (photo: IPhoto) => {
		profile.photosService.deletePhoto({ photoId: photo.id, imageUrl: photo.path, isAvatar: false });
	};

	return <GridComponent>
		<PaperComponent className="photo-container paper-block">
			<div className="photo-container__title">
				<div className="block-title photo-container__title__text">
					{i18next.t("profile-module.my_photos")}

					<span className="counter">{photosCount}</span>
				</div>

				<LinkComponent
					variant="body2" 
					onClick={() => navigate(Pages.photos)} 
					underline="hover" 
					className="photo-container__title__link"
				>
					{i18next.t("profile-module.watch_all")}
				</LinkComponent>
			</div>

			{isPhotosLoading 
				? <SpinnerComponent />
				: photos && photos.length 
					? <div className="photo-container__photos">
						{photos.slice(0, 3).map((photo, index) => {
							return <div key={photo.id} className="photo-container__photos__wrapper">
								<PhotoComponent
									key={photo.id}
									src={photo.path}
									alt={profile.userService.fullName + " " + index}
									clickHandler={() => onClickPhoto(index)}
									deleteHandler={() => deleteOnePhoto(photo)}
								/>
							</div>;
						})}
					</div>
					: <NoDataComponent text={i18next.t("profile-module.no_photos")} />
			}

			<InputImageComponent 
				id="add-new-photos" 
				text={i18next.t("profile-module.add_more")} 
				loading={isAddPhotosLoading} 
				multiple 
				onChange={addPhotosHandler} 
			/>
		</PaperComponent>
	</GridComponent>;
}
