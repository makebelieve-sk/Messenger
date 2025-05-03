import { createContext } from "react";

import App from "@components/main/app";
import MainClient from "@core/MainClient";

const mainClient = new MainClient();

// Инициализируем основной контекст всего приложения, куда прокидываем сущность MainClient
export const MainClientContext = createContext<MainClient>(mainClient);

// Основной компонент, главная задача которого ровно один раз инициализировать ядро бизнес-логики при открытии страницы пользователем
export default function MainClientProvider() {
	return <MainClientContext.Provider value={mainClient}>
		<App />
	</MainClientContext.Provider>;
};