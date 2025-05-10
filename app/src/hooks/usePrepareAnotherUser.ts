import { useEffect } from "react";

import useMainClient from "@hooks/useMainClient";
import useUserIdFromPath from "@hooks/useUserIdOutsideRoute";
import useProfileStore from "@store/profile";

// Подготовка профиля другого пользователя
export default function usePrepareAnotherUser() {
	const userId = useUserIdFromPath();

	const isLoading = useProfileStore(state => state.isPrepareAnotherUser);

	const mainClient = useMainClient();
	const isExistProfile = mainClient.existProfile(userId);

	// Получение информации о другом пользователе
	useEffect(() => {
		/**
         * Если профиль пользователя не существует, то необходимо получить информацию о нем.
         * Если профиль пользователя существует, то необходимо сбросить флаг загрузки профиля.
         */
		if (userId && !isExistProfile) {
			if (!isLoading) {
				useProfileStore.getState().setPrepareAnotherUser(true);
			}

			mainClient.mainApi.getAnotherUser(userId);
		} else if (isExistProfile) {
			useProfileStore.getState().setPrepareAnotherUser(false);
		}
	}, [ userId, isExistProfile ]);

	return { isLoading, isExistProfile };
};