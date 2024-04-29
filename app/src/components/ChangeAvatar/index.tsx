import React from "react";
import { ApiRoutes } from "../../types/enums";
import { MainClientContext } from "../App";

interface ChangeAvatar {
    labelText: string;
    mustAuth?: boolean;
    onChange: (field: string, value: string) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export default React.memo(function ChangeAvatar({ labelText, mustAuth = false, onChange, setLoading }: ChangeAvatar) {
    const mainClient = React.useContext(MainClientContext);

    // Функция изменения аватарки
    const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
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
        } catch (error: any) {
            const errorText = `Ошибка при изменении аватара: ${error}`;
            mainClient.catchErrors(errorText);
        }
    };

    // Отправка аватара на сервер
    const uploadImage = (file: File) => {
        const formData = new FormData();    // Создаем объект FormData
        formData.append("avatar", file);    // Добавляем файл в объект formData (на сервере будет req.file, где мидлвар FileController.uploader.single("avatar"))

        mainClient.postRequest(
            mustAuth ? ApiRoutes.uploadAvatarAuth : ApiRoutes.saveAvatar,
            formData,
            setLoading,
            (data: { success: boolean; url: string; }) => {
                if (data.success) {
                    // Обновляем поле avatarUrl в объекте пользователя
                    onChange("avatarUrl", data.url);
                }
            },
            undefined,
            undefined,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
    };

    return <label htmlFor={`change-avatar-${labelText}`}>
        {labelText}
        <input id={`change-avatar-${labelText}`} type="file" accept="image/*" hidden onChange={handleChangeImage} />
    </label>
});