import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import useProfile from "../../../hooks/useProfile";
import ChangeAvatar from "../../../components/ChangeAvatar";
import Photo from "../../../components/Common/Photo";

import "./main-photo.scss";

export default function MainPhoto() {
    const [loading, setLoading] = React.useState(false);

    const profile = useProfile();
    
    // Клик по своей аватарке
    const onClickMainPhoto = () => {
        profile.onClickAvatar();
    };

    // Удаление аватара
    const deleteAvatar = (setLoading?: React.Dispatch<React.SetStateAction<boolean>>) => {
        profile.onDeleteAvatar(setLoading);
    };

    // Установка/обновление своего аватара
    const onSetAvatar = (updateOptions: { id: string; newAvatarUrl: string; newPhotoUrl: string; }) => {
        profile.onSetAvatar(updateOptions);
    };

    return <Grid item>
        <Paper className="main-photo paper-block">
            <Photo
                src={profile.user.avatarUrl}
                alt="user-avatar"
                clickHandler={onClickMainPhoto}
                deleteHandler={deleteAvatar}
            />

            <div className="main-photo__edit-button">
                <ChangeAvatar
                    labelText="Изменить"
                    loading={loading}
                    mustAuth
                    onChange={onSetAvatar}
                    setLoading={setLoading}
                />
            </div>
        </Paper>
    </Grid>
};