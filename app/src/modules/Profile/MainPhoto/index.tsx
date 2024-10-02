import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import { useAppSelector } from "../../../hooks/useGlobalState";
import useProfile from "../../../hooks/useProfile";
import { selectUserState } from "../../../state/user/slice";
import ChangeAvatar from "../../../components/ChangeAvatar";
import Photo from "../../../components/Common/Photo";

import "./main-photo.scss";

export default React.memo(function MainPhoto() {
    const [loading, setLoading] = React.useState(false);

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
            <Photo
                src={user.avatarUrl}
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
});