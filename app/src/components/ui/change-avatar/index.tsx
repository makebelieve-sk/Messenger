import { type ChangeEvent, memo } from "react";

import InputImageComponent from "@components/ui/input-image";
import useMainClient from "@hooks/useMainClient";
import { ApiRoutes } from "@custom-types/enums";
import { type IPhoto } from "@custom-types/models.types";

export interface IUpdatedAvatar {
	newAvatar: IPhoto;
	newPhoto: IPhoto;
};

interface IChangeAvatarComponent {
	labelText: string;
	loading: boolean;
	mustAuth?: boolean;
	onChange: (updateOptions: IUpdatedAvatar) => void;
	setLoading: (isLoading: boolean) => void;
};

// Базовый компонент для смены аватара (используется для смены аватара на страницах регистрации/профиля)
export default memo(function ChangeAvatarComponent({ labelText, loading, mustAuth = false, onChange, setLoading }: IChangeAvatarComponent) {
	const { mainApi } = useMainClient();

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
		const formData = new FormData(); // Создаем объект FormData
		formData.append("avatar", file); // Добавляем файл аватара в объект formData

		mainApi.uploadAvatarAuth(
			mustAuth ? ApiRoutes.changeAvatar : ApiRoutes.uploadAvatar,
			formData,
			setLoading,
			(data: IUpdatedAvatar) => {
				// Обновляем поле avatarUrl в объекте пользователя
				onChange(data);
			},
		);
	};

	return <InputImageComponent 
		id={`change-avatar-${labelText}`} 
		text={labelText} 
		loading={loading} 
		onChange={handleChangeImage} 
	/>;
});