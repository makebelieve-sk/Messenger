import { MY_ID } from "../utils/constants";
import useMainClient from "./useMainClient";

// Возврат сущности "Профиль" конкретного пользователя по переданному идентификатору
export default function useProfile(userId: string = MY_ID) {
    const mainClient = useMainClient();
    return mainClient.getProfile(userId);
};