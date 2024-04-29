import React from "react";
import { Route, Routes, useNavigate, useLocation, Navigate } from "react-router-dom";
import Profile from "../pages/Profile";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import { Pages } from "../types/enums";
import { MainClientContext } from "../components/App";
import { useAppDispatch, useAppSelector } from "../hooks/useGlobalState";
import { setIsAuth } from "../state/main/slice";
import { selectUserState } from "../state/user/slice";

export default function Router() {
    const mainClient = React.useContext(MainClientContext);
    
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppSelector(selectUserState);

    // Получение пользователя
    React.useEffect(() => {
        mainClient.setNavigate(navigate);
        mainClient.getUser();
    }, []);

    // Если есть пользователь, то инициализируем сокет
    React.useEffect(() => {
        if (user) {
            dispatch(setIsAuth(true));

            mainClient.initSocket();

            redirectHandler();
        }
    }, [user]);

    const redirectHandler = () => {
        switch (location.pathname) {
            case Pages.main:
            case Pages.signIn:
            case Pages.signUp:
                navigate(Pages.profile);
                break;
        }
    };

    return <Routes>
        <Route path={Pages.profile} element={<Profile />} />
        <Route path={Pages.signIn} element={<SignIn />} />
        <Route path={Pages.signUp} element={<SignUp />} />
        <Route path={Pages.notExists} element={<Navigate to={Pages.profile} />} />
    </Routes>
}