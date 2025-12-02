import { memo, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import CompletePhone from "@pages/CompletePhone";
import Edit from "@pages/Edit";
import Friends from "@pages/Friends";
import Photos from "@pages/Photos";
import Profile from "@pages/Profile";
import SignIn from "@pages/SignIn";
import SignUp from "@pages/SignUp";
import useGlobalStore from "@store/global";
import useUserStore from "@store/user";
import { Pages } from "@custom-types/enums";
import { TEMP_PHONE_PLACEHOLDER } from "@utils/constants";

// Основной компонент маршрутизации. Отвечает как за защищенные маршруты, так и за аутентификационные.
export default memo(function Router({ isAuth }: { isAuth: boolean; }) {
	const redirectTo = useGlobalStore(state => state.redirectTo);
	const navigate = useNavigate();
	const user = useUserStore(state => state.user);

	// Перенаправляем пользователя
	useEffect(() => {
		const currentPath = window.location.pathname;
		const isAlreadySignUpPage = redirectTo === Pages.signIn && currentPath === Pages.signUp;

		if (redirectTo && !isAlreadySignUpPage && currentPath !== redirectTo) {
			navigate(redirectTo);
		}
	}, [ redirectTo ]);

	// Проверяем, нужно ли редиректить на страницу ввода телефона
	useEffect(() => {
		if (isAuth && user && user.phone === TEMP_PHONE_PLACEHOLDER) {
			const currentPath = window.location.pathname;
			// Если пользователь не на странице ввода телефона, редиректим туда
			if (currentPath !== Pages.completePhone) {
				navigate(Pages.completePhone, { replace: true });
			}
		}
	}, [ isAuth, user, navigate ]);

	return isAuth 
		? <Routes>
			<Route path={Pages.completePhone} element={<CompletePhone />} />
			<Route path={Pages.profileUser} element={<Profile />} />
			<Route path={Pages.edit} element={<Edit />} />
			<Route path={Pages.messages} element={<div>228</div>} />
			<Route path={Pages.friendsUser} element={<Friends />} />
			<Route path={Pages.photosUser} element={<Photos />} />
			<Route path={Pages.notExists} element={<Navigate to={Pages.profile} />} />
		</Routes>
	 	: <Routes>
			<Route path={Pages.signIn} element={<SignIn />} />
			<Route path={Pages.signUp} element={<SignUp />} />
			{/* <Route path={Pages.notExists} element={<Navigate to={Pages.signIn} />} /> */}
		</Routes>;
});