import useUser from "@hooks/useUser";
import { MY_ID } from "@utils/constants";

// Возврат сущности "Дополнительная информация пользователя" по переданному идентификатору
export default function useUserDetails(userId: string = MY_ID) {
    const user = useUser(userId);
    return user.userDetails;
}