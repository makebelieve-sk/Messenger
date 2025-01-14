import { useContext, memo, ChangeEvent, Dispatch, SetStateAction } from "react";

import InputImageComponent from "../../ui/InputImage";
import { ApiRoutes } from "../../../types/enums";
import { MainClientContext } from "../../main/Main";

interface ChangeAvatar {
    labelText: string;
    loading: boolean;
    mustAuth?: boolean;
    onChange: ({ id, newAvatarUrl, newPhotoUrl }: { id: string; newAvatarUrl: string; newPhotoUrl: string; }) => void;
    setLoading: Dispatch<SetStateAction<boolean>>;
};

// Базовый компонент смены изображения (используется только для изменения главной фотографии пользователя)
export default memo(function ChangeAvatarComponent({ labelText, loading, mustAuth = false, onChange, setLoading }: ChangeAvatar) {
    const mainClient = useContext(MainClientContext);

    // Функция изменения аватарки
    const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
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

    return <InputImageComponent 
        id={`change-avatar-${labelText}`}
        text={labelText}
        loading={loading}
        onChange={handleChangeImage}
    />
});