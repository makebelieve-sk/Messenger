import { useState, memo } from "react";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import { useAppSelector } from "../../../hooks/useGlobalState";
import useProfile from "../../../hooks/useProfile";
import { selectUserState } from "../../../store/user/slice";
import ChangeAvatarComponent from "../../../components/ui/ChangeAvatar";
import PhotoComponent from "../../../components/ui/Photo";

import "./main-photo.scss";

export default memo(function MainPhoto() {
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    const { user } = useAppSelector(selectUserState);
    const profile = useProfile();
    
    // Клик по своей аватарке
    const onClickMainPhoto = () => {
        profile.onClickAvatar();
    };

    // Удаление аватара
    const deleteAvatar = () => {
        profile.onDeleteAvatar();
    };

    // Установка/обновление своего аватара
    const onSetAvatar = (updateOptions: { id: string; newAvatarUrl: string; newPhotoUrl: string; }) => {
        profile.onSetAvatar(updateOptions);
    };

    return <Grid item>
        <Paper className="main-photo paper-block">
            <PhotoComponent
                src={user.avatarUrl}
                alt="user-avatar"
                clickHandler={onClickMainPhoto}
                deleteHandler={deleteAvatar}
            />

            <div className="main-photo__edit-button">
                <ChangeAvatarComponent
                    labelText={t("profile-module.change")}
                    loading={loading}
                    mustAuth
                    onChange={onSetAvatar}
                    setLoading={setLoading}
                />
            </div>
        </Paper>
    </Grid>
});