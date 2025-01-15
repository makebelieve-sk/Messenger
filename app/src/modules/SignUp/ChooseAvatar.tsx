import { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

import ChangeAvatarComponent from "../../components/ui/ChangeAvatar";
import PhotoComponent from "../../components/ui/Photo";
import { AVATAR_URL } from "../../utils/files";

import "./sign-up.scss";

interface IChooseAvatar {
    username: string;
    avatarUrl: string;
    onChange: (field: string, value: string, validateCallback?: (value: string) => string, anotherField?: string) => void;
};

export default memo(function ChooseAvatar({ username, avatarUrl, onChange }: IChooseAvatar) {
    const [avatarLetters, setAvatarLetters] = useState("");
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();

    useEffect(() => {
        if (username) {
            setAvatarLetters(username.split(" ").map(str => str[0]).join(""));
        }
    }, [username]);

    // Удаление аватара
    const deleteAvatar = () => {
        onChange(AVATAR_URL, "");
    };

    // Изменение своей аватарки
    const onChangeAvatar = ({ newAvatarUrl }: { newAvatarUrl: string; }) => {
        onChange(AVATAR_URL, newAvatarUrl);        // Обновляем поле avatarUrl в объекте пользователя
    };

    return (
        <Box className="choose-avatar">
            <Grid container spacing={2} className="choose-avatar__container">
                <Grid item xs={8}>
                    <Typography className="choose-avatar__container__main-text">
                        {username}, { t("profile-module.how_like_avatar") }
                    </Typography>
                </Grid>

                <Grid item xs={8} className="choose-avatar__container__avatar-wrapper">
                    {loading
                        ? <Skeleton variant="rectangular" className="choose-avatar__container__avatar-loading" />
                        : avatarUrl
                            ? <div className="choose-avatar__container__avatar">
                                <PhotoComponent
                                    src={avatarUrl}
                                    alt="user-avatar"
                                    deleteHandler={deleteAvatar}
                                />
                            </div>
                            : <div className="choose-avatar__container__avatar-without-user">{avatarLetters}</div>
                    }
                </Grid>

                <Grid item xs={8} className="choose-avatar__container__change-photo">
                    <ChangeAvatarComponent 
                        labelText={t("profile-module.choose_another_photo")}
                        loading={loading}
                        onChange={onChangeAvatar}
                        setLoading={setLoading}
                    />
                </Grid>
            </Grid>
        </Box>
    );
});