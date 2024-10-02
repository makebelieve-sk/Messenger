import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Profile from "../pages/Profile";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import { Pages } from "../types/enums";

export default function Router() {
    return <Routes>
        <Route path={Pages.profile} element={<Profile />} />
        <Route path={Pages.messages} element={<div>228</div>} />
        <Route path={Pages.signIn} element={<SignIn />} />
        <Route path={Pages.signUp} element={<SignUp />} />
        <Route path={Pages.notExists} element={<Navigate to={Pages.profile} />} />
    </Routes>
}