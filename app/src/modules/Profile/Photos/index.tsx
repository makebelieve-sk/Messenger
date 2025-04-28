import { useEffect,useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import GridComponent from "@components/ui/grid";
import InputImageComponent from "@components/ui/input-image";
import LinkComponent from "@components/ui/link";
import NoDataComponent from "@components/ui/no-data";
import PaperComponent from "@components/ui/paper";
import PhotoComponent from "@components/ui/photo";
import SpinnerComponent from "@components/ui/spinner";
import { useAppSelector } from "@hooks/useGlobalState";
import useProfile from "@hooks/useProfile";
import { selectUserState } from "@store/user/slice";
import { Pages } from "@custom-types/enums";

import "./photos.scss";

export default function Photos() {
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const profile = useProfile();
  const { t } = useTranslation();
  const { photos } = useAppSelector(selectUserState);
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

    if (fileList && fileList.length) {
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
      { imageUrl: photoPath, isAvatar: false },
      photos,
      photoPath
    );
  };

  return (
    <GridComponent className="photo-container__grid">
      <PaperComponent className="photo-container paper-block">
        <div className="photo-container__title">
          <div className="block-title photo-container__title__text">
            {t("profile-module.my_photos")}
            <span className="counter">{photos.length}</span>
          </div>

          <LinkComponent
            variant="body2"
            onClick={() => navigate(Pages.photos)}
            underline="hover"
            className="photo-container__title__link"
          >
            {t("profile-module.watch_all")}
          </LinkComponent>
        </div>

        {
          loadingPhotos
            ? <SpinnerComponent />
            : photos && photos.length
              ? <div className="photo-container__photos">
                {photos.slice(0, 3).map((photo, index) => {
                  return <div key={photo.id} className="photo-container__photo-wrapper">
                    <PhotoComponent
                      key={photo.id}
                      src={photo.path}
                      alt={profile.user.fullName + " " + index}
                      clickHandler={() => onClickPhoto(index)}
                      deleteHandler={() => deleteOnePhoto(photo.path)}
                    />
                  </div>
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
      </PaperComponent>
    </GridComponent>
  );
};