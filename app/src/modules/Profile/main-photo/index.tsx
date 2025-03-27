import { useState } from "react";
import { useTranslation } from "react-i18next";
import GridComponent from "@components/ui/Grid";

import useProfile from "@hooks/useProfile";
import ChangeAvatarComponent from "@components/ui/change-avatar";
import PhotoComponent from "@components/ui/photo";
import PaperComponent from "@components/ui/Paper";

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

    return <GridComponent className="main-photo__grid">
        <PaperComponent className="main-photo paper-block">
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
        </PaperComponent>
    </GridComponent>;
};