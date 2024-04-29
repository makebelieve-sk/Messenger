import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import ChangeAvatar from "../../components/ChangeAvatar";

import "./sign-up.scss";

interface IChooseAvatar {
    username: string;
    initialAvatarUrl: string;
    onChange: (field: string, value: string, validateCallback?: (value: string) => string, anotherField?: string) => void;
};

export default React.memo(function ChooseAvatar({ username, initialAvatarUrl, onChange }: IChooseAvatar) {
    const [avatarUrl, setAvatarUrl] = React.useState<string>(initialAvatarUrl);
    const [loading, setLoading] = React.useState(false);

    const avatarLetters = username.split(" ").map(str => str[0]).join("");

    // Изменение своей аватарки
    const onChangeAvatar = (field: string, value: string) => {
        setAvatarUrl(value);           // Устанавливаем аватарку с сервера (jpeg, обрезанную)
        onChange(field, value);        // Обновляем поле avatarUrl в объекте пользователя
    };

    return (
        <Box className="choose-avatar">
            <Grid container spacing={2} className="choose-avatar__container">
                <Grid item xs={8}>
                    <Typography className="choose-avatar__container__main-text">{username}, как на счет такого аватара?</Typography>
                </Grid>

                <Grid item xs={8} className="choose-avatar__container__avatar-wrapper">
                    {loading
                        ? <Skeleton variant="rectangular" className="choose-avatar__container__avatar-loading" />
                        : avatarUrl
                            ? <img alt="User avatar" src={avatarUrl} className="choose-avatar__container__avatar" />
                            : <div className="choose-avatar__container__avatar-without-user">{avatarLetters}</div>
                    }
                </Grid>

                <Grid item xs={8} className="choose-avatar__container__change-photo">
                    <ChangeAvatar 
                        labelText="Выбрать другое фото"
                        onChange={onChangeAvatar}
                        setLoading={setLoading}
                    />
                </Grid>
            </Grid>
        </Box>
    );
});