import useUser from "@hooks/useUser";

// Возврат сущности "Дополнительная информация пользователя" по переданному идентификатору
export default function useUserDetails(userId?: string) {
	const user = useUser(userId);
	return user.detailsService;
}
