import useProfile from "@hooks/useProfile";
import { MY_ID } from "@utils/constants";

// Возврат сущности "Пользователь" по переданному идентификатору
export default function useUser(userId: string = MY_ID) {
    const profile = useProfile(userId);
    return profile.user;
}