import { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";

import Skeleton from "@mui/material/Skeleton";
import BoxComponent from "@components/ui/Box";
import GridComponent from "@components/ui/Grid";
import TypographyComponent from "@components/ui/Typography";
import ChangeAvatarComponent from "@components/ui/change-avatar";
import PhotoComponent from "@components/ui/photo";
import { AVATAR_URL } from "@utils/files";

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
        <BoxComponent className="choose-avatar">
            <GridComponent container spacing={2} className="choose-avatar__container">
                <GridComponent xs={8}>
                    <TypographyComponent className="choose-avatar__container__main-text">
                        {username}, {t("profile-module.how_like_avatar")}
                    </TypographyComponent>
                </GridComponent>

                <GridComponent xs={8} className="choose-avatar__container__avatar-wrapper">
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
                </GridComponent>

                <GridComponent xs={8} className="choose-avatar__container__change-photo">
                    <ChangeAvatarComponent
                        labelText={t("profile-module.choose_another_photo")}
                        loading={loading}
                        onChange={onChangeAvatar}
                        setLoading={setLoading}
                    />
                </GridComponent>
            </GridComponent>
        </BoxComponent>
    );
});