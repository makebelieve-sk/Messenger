import React from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";

import Profile from "../pages/Profile";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import { Pages } from "../types/enums";
import { MainClientContext } from "./AppService";
import { selectMainState } from "../state/main/slice";
import { useAppSelector } from "../hooks/useGlobalState";
import Edit from "../pages/edit";

export default function Router() {
    const { isAuth } = useAppSelector(selectMainState);
    const navigate = useNavigate();
    const mainClient = React.useContext(MainClientContext);

    React.useEffect(() => {
        mainClient.on("redirect", (path: string) => {
            navigate(path);
        });
    }, []);
    
    return isAuth
        ? <Routes>
            <Route path={Pages.profile} element={<Profile />} />
            <Route path={Pages.edit} element={<Edit/>} />
            <Route path={Pages.messages} element={<div>228</div>} />
            <Route path={Pages.notExists} element={<Navigate to={Pages.profile} />} />
        </Routes>
        : <Routes>
            <Route path={Pages.signIn} element={<SignIn />} />
            <Route path={Pages.signUp} element={<SignUp />} />
            <Route path={Pages.notExists} element={<Navigate to={Pages.signIn} />} />
        </Routes>
}