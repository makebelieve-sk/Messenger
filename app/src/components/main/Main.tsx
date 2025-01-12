import React from "react";

import App from "./App";
import MainClient from "../../core/MainClient";
import { useAppDispatch } from "../../hooks/useGlobalState";

export const MainClientContext = React.createContext<MainClient>(undefined as never);

export default function Main() {
    const dispatch = useAppDispatch();

    const mainClient = new MainClient(dispatch);

    return <MainClientContext.Provider value={mainClient}>
        <App />
    </MainClientContext.Provider>
}