import { createContext } from "react";
import { ThemeProvider } from "@mui/material/styles";

import App from "@components/main/app";
import MainClient from "@core/MainClient";
import { useAppDispatch } from "@hooks/useGlobalState";
import useTheme from "@hooks/useTheme";

export const MainClientContext = createContext<MainClient>(undefined as never);

// Основной компонент, главная задача которого ровно один раз инициализировать ядро бизнес-логики при открытии страницы пользователем
export default function Main() {
    const dispatch = useAppDispatch();
    const { THEME, setIsDarkMode } = useTheme();
    const mainClient = new MainClient(dispatch);

    return <ThemeProvider theme={THEME}>
        <MainClientContext.Provider value={mainClient}>
            <App _={setIsDarkMode} />
        </MainClientContext.Provider>
    </ThemeProvider>
}