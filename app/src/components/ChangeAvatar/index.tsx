import React from "react";

import { ApiRoutes } from "../../types/enums";
import InputImage from "../Common/InputImage";
import useMainClient from "../../hooks/useMainClient";

interface ChangeAvatar {
    labelText: string;
    loading: boolean;
    mustAuth?: boolean;
    onChange: ({ id, newAvatarUrl, newPhotoUrl }: { id: string; newAvatarUrl: string; newPhotoUrl: string; }) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export default React.memo(function ChangeAvatar({ labelText, loading, mustAuth = false, onChange, setLoading }: ChangeAvatar) {
    const { mainApi } = useMainClient();

    // Функция изменения аватарки
    const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;

        if (target && target.files) {
            const file = target.files[0];

            if (file) {
                // Очищаем значение инпута
                target.value = "";

                // Даем запрос на обновление аватарки
                uploadImage(file);
            }
        }
    };

    // Отправка аватара на сервер
    const uploadImage = (file: File) => {
        const formData = new FormData();    // Создаем объект FormData
        formData.append("avatar", file);    // Добавляем файл аватара в объект formData

        mainApi.uploadAvatarAuth(
            mustAuth ? ApiRoutes.changeAvatar : ApiRoutes.uploadAvatar,
            formData,
            setLoading,
            (data: { success: boolean; id: string; newAvatarUrl: string; newPhotoUrl: string; }) => {
                // Обновляем поле avatarUrl в объекте пользователя
                onChange(data);
            }
        );
    };

    return <InputImage 
        id={`change-avatar-${labelText}`}
        text={labelText}
        loading={loading}
        onChange={handleChangeImage}
    />
});