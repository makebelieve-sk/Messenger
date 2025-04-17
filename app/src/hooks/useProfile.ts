import useMainClient from "@hooks/useMainClient";

// Возврат сущности "Профиль" конкретного пользователя по переданному идентификатору
export default function useProfile(userId?: string) {
	const mainClient = useMainClient();
	return mainClient.getProfile(userId);
}
