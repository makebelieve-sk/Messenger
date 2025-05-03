import { memo, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import Edit from "@pages/Edit";
import Profile from "@pages/Profile";
import SignIn from "@pages/SignIn";
import SignUp from "@pages/SignUp";
import useGlobalStore from "@store/global";
import { Pages } from "@custom-types/enums";

// Основной компонент маршрутизации. Отвечает как за защищенные маршруты, так и за аутентификационные.
export default memo(function Router({ isAuth }: { isAuth: boolean; }) {
	const redirectTo = useGlobalStore(state => state.redirectTo);
	const navigate = useNavigate();

	// Перенаправляем пользователя
	useEffect(() => {
		const currentPath = window.location.pathname;
		const isAlreadySignUpPage = redirectTo === Pages.signIn && currentPath === Pages.signUp;

		if (redirectTo && !isAlreadySignUpPage && currentPath !== redirectTo) {
			navigate(redirectTo);
		}
	}, [ redirectTo ]);

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
		</Routes>;
});
