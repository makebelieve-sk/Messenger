import React from "react";
import { useNavigate } from "react-router-dom";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import { useAppSelector } from "../../../hooks/useGlobalState";
import useProfile from "../../../hooks/useProfile";
import { selectUserState } from "../../../state/user/slice";
import { Pages } from "../../../types/enums";
import { getFullName } from "../../../utils";
import Photo from "../../../components/Common/Photo";
import InputImage from "../../../components/Common/InputImage";
import NoItems from "../../../components/Common/NoItems";
import Spinner from "../../../components/Common/Spinner";

import "./photos.scss";

export default React.memo(function Photos() {
    const [loadingPhotos, setLoadingPhotos] = React.useState(false);
    const [loadingBtn, setLoadingBtn] = React.useState(false);

    const profile = useProfile();

    const { user, photos } = useAppSelector(selectUserState);
    const navigate = useNavigate();

    // Получаем все фотографии пользователя
    React.useEffect(() => {
        profile.getAllPhotos(setLoadingPhotos);
    }, []);

    // Обновляем счетчик фотографий
    React.useEffect(() => {
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

            files.forEach(file => {
                formData.append("photo", file);
            });

            profile.addPhotos(formData, setLoadingBtn);
        }
    };

    // Удаление одной фотографии
    const deleteOnePhoto = (photoPath: string) => {
        profile.deletePhoto({ fileUrl: photoPath, isAvatar: false }, photos, photoPath);
    };

    return <Grid item>
        <Paper className="photo-container paper-block">
            <div className="photo-container__title">
                <div className="block-title photo-container__title__text">
                    Мои фотографии <span className="counter">{photos.length}</span>
                </div>

                <Link variant="body2" onClick={() => navigate(Pages.photos)} underline="hover" className="photo-container__title__link">
                    Посмотреть все
                </Link>
            </div>

            {loadingPhotos
                ? <Spinner />
                : photos && photos.length
                    ? <div className="photo-container__photos">
                        {photos.slice(0, 3).map((photo, index) => {
                            return <Photo
                                key={photo.id}
                                src={photo.path}
                                alt={getFullName(user) + " " + index}
                                clickHandler={() => onClickPhoto(index)}
                                deleteHandler={() => deleteOnePhoto(photo.path)}
                            />
                        })}
                    </div>
                    : <NoItems text="Нет фотографий" />
            }

            <InputImage 
                id="add-new-photos"
                text="Добавить еще"
                loading={loadingBtn}
                multiple
                onChange={addPhotosHandler}
            />
        </Paper>
    </Grid>
});