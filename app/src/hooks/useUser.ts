import useProfile from "@hooks/useProfile";

// Возврат сущности "Пользователь" по переданному идентификатору
export default function useUser(userId?: string) {
	const profile = useProfile(userId);
	return profile.userService;
}
