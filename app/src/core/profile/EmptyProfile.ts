import Request from "../Request";
import Profile from "./Profile";
import { AppDispatch } from "../../types/redux.types";

// Класс, представляет собой заглушку "Пустого пользователя". Если искомый пользователь не найден, то возвращается данный класс и происходит выброс ошибки.
export default class EmptyProfile extends Profile {
    constructor(...args: [string, Request, AppDispatch]) {
        super(...args);
    }
}