import { type ChangeEvent, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import GridComponent from "@components/ui/grid";
import InputImageComponent from "@components/ui/input-image";
import LinkComponent from "@components/ui/link";
import NoDataComponent from "@components/ui/no-data";
import PaperComponent from "@components/ui/paper";
import PhotoComponent from "@components/ui/photo";
import SpinnerComponent from "@components/ui/spinner";
import useProfile from "@hooks/useProfile";
import useUser from "@hooks/useUser";
import i18next from "@service/i18n";
import usePhotosStore from "@store/photos";
import { Pages } from "@custom-types/enums";
import { type IPhoto } from "@custom-types/models.types";
import { goToAnotherProfile } from "@utils/index";

import "./photos.scss";

// Компонент отрисовки блока фотографий на странице профиля
export default function Photos() {
	const { userId } = useParams();
	const navigate = useNavigate();

	const isPhotosLoading = usePhotosStore(state => state.isPhotosLoading);
	const isAddPhotosLoading = usePhotosStore(state => state.isAddPhotosLoading);
	const photos = usePhotosStore(state => state.photos);
	const photosCount = usePhotosStore(state => state.count);

	const profile = useProfile(userId);
	const photosService = useUser(userId).photosService;

	// Загружаем первую страницу фотографий
	useEffect(() => {
		photosService.getAllPhotos();
	}, [ userId ]);

	// Обработка клика по блоку фотографий
	const onClickPhotos = () => {
		navigate(goToAnotherProfile(Pages.photos, userId));
	};

	// Клик по одной из своих фотографий
	const onClickPhoto = (photoId: string) => {
		photosService.onClickPhoto(photoId);
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

			photosService.addPhotos(formData);
		}
	};

	// Удаление одной фотографии
	const deleteOnePhoto = (photo: IPhoto) => {
		photosService.deletePhoto(
			{ photoId: photo.id, imageUrl: photo.path, isAvatar: false },
			true,
		);
	};

	return <GridComponent>
		<PaperComponent className="photo-container paper-block">
			<div className="photo-container__title">
				<div className="block-title photo-container__title__text">
					{profile.isMe
						? i18next.t("profile-module.my_photos")
						: i18next.t("profile-module.photos")
					}

					<span className="counter">{photosCount}</span>
				</div>

				<LinkComponent
					variant="body2"
					onClick={onClickPhotos}
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
									clickHandler={() => onClickPhoto(photo.id)}
									deleteHandler={() => deleteOnePhoto(photo)}
								/>
							</div>;
						})}
					</div>
					: <NoDataComponent text={i18next.t("profile-module.no_photos")} />
			}

			{profile.isMe
				? <InputImageComponent
					id="profile-add-new-photos"
					text={i18next.t("profile-module.add_more")}
					loading={isAddPhotosLoading}
					multiple
					onChange={addPhotosHandler}
				/>
				: null
			}
		</PaperComponent>
	</GridComponent>;
};