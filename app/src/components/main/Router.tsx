import { useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";

import Profile from "@pages/Profile";
import SignIn from "@pages/SignIn";
import SignUp from "@pages/SignUp";
import Edit from "@pages/Edit";
import { selectMainState } from "@store/main/slice";
import { useAppSelector } from "@hooks/useGlobalState";
import useMainClient from "@hooks/useMainClient";
import { Pages } from "@custom-types/enums";
import { MainClientEvents } from "@custom-types/events";

// Основной компонент маршрутизации. Отвечает как за защищенные маршруты, так и за авторизационные.
export default function Router() {
	const mainClient = useMainClient();
	const navigate = useNavigate();
	const { isAuth } = useAppSelector(selectMainState);

	useEffect(() => {
		// Перенаправляем пользователя в зависимости от полученного пути из бизнес-логики
		mainClient.on(MainClientEvents.REDIRECT, onRedirect);

		// Отписываемся от события при размонтировании компонента для избежания утечки памяти
		return () => {
			mainClient.off(MainClientEvents.REDIRECT, onRedirect);
		};
	}, []);

    // Обработчик события MainClientEvents.REDIRECT
    const onRedirect = (path: string) => {
        navigate(path);
    }
    
    return isAuth
        ? <Routes>
            <Route path={Pages.profile} element={<Profile />} />
            <Route path={Pages.edit} element={<Edit />} />
            <Route path={Pages.messages} element={<div>228</div>} />
            <Route path={Pages.notExists} element={<Navigate to={Pages.profile} />} />
        </Routes>
        : <Routes>
            <Route path={Pages.signIn} element={<SignIn />} />
            <Route path={Pages.signUp} element={<SignUp />} />
            <Route path={Pages.notExists} element={<Navigate to={Pages.signIn} />} />
        </Routes>
}
