import { createContext } from "react";

import App from "./App";
import MainClient from "../../core/MainClient";
import { useAppDispatch } from "../../hooks/useGlobalState";

export const MainClientContext = createContext<MainClient>(undefined as never);

// Основной компонент, главная задача которого ровно один раз инициализировать ядро бизнес-логики при открытии страницы пользователем
export default function Main() {
    const dispatch = useAppDispatch();

    const mainClient = new MainClient(dispatch);

    return <MainClientContext.Provider value={mainClient}>
        <App />
    </MainClientContext.Provider>
}