import React from "react";

import { ApiRoutes } from "../../types/enums";
import { MainClientContext } from "../../service/AppService";
import InputImage from "../Common/InputImage";

interface ChangeAvatar {
    labelText: string;
    loading: boolean;
    mustAuth?: boolean;
    onChange: ({ id, newAvatarUrl, newPhotoUrl }: { id: string; newAvatarUrl: string; newPhotoUrl: string; }) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export default React.memo(function ChangeAvatar({ labelText, loading, mustAuth = false, onChange, setLoading }: ChangeAvatar) {
    const mainClient = React.useContext(MainClientContext);

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

        mainClient.mainApi.uploadAvatarAuth(
            mustAuth ? ApiRoutes.uploadAvatarAuth : ApiRoutes.saveAvatar,
            formData,
            setLoading,
            (data: { success: boolean; id: string; newAvatarUrl: string; newPhotoUrl: string; }) => {
                if (data.success) {
                    // Обновляем поле avatarUrl в объекте пользователя
                    onChange({ id: data.id, newAvatarUrl: data.newAvatarUrl, newPhotoUrl: data.newPhotoUrl });
                }
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