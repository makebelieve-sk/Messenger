import { MY_ID } from "../utils/constants";
import useUser from "./useUser";

// Возврат сущности "Дополнительная информация пользователя" по переданному идентификатору
export default function useUserDetails(userId: string = MY_ID) {
    const user = useUser(userId);
    return user.userDetails;
}