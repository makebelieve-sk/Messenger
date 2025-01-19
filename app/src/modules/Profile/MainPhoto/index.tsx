import { useState } from "react";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import useProfile from "@hooks/useProfile";
import ChangeAvatarComponent from "@components/ui/ChangeAvatar";
import PhotoComponent from "@components/ui/Photo";

import "./main-photo.scss";

export default function MainPhoto() {
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    const profile = useProfile();
    
    // Клик по своей аватарке
    const clickHandler = () => {
        profile.onClickAvatar();
    };

    // Установка/обновление своего аватара
    const changeHandler = (updateOptions: { id: string; newAvatarUrl: string; newPhotoUrl: string; }) => {
        profile.onSetAvatar(updateOptions);
    };

    // Удаление аватара
    const deleteHandler = () => {
        profile.onDeleteAvatar(setLoading);
    };

    return <Grid item>
        <Paper className="main-photo paper-block">
            <PhotoComponent
                src={profile.user.avatarUrl}
                alt="user-avatar"
                clickHandler={clickHandler}
                deleteHandler={deleteHandler}
            />

            <div className="main-photo__edit-button">
                <ChangeAvatarComponent
                    labelText={t("profile-module.change")}
                    loading={loading}
                    mustAuth
                    onChange={changeHandler}
                    setLoading={setLoading}
                />
            </div>
        </Paper>
    </Grid>
};