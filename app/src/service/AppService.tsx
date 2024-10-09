import React from "react";

import MainClient from "../core/MainClient";
import { useAppDispatch } from "../hooks/useGlobalState";
import App from "../components/App";

export const MainClientContext = React.createContext<MainClient>(undefined as never);

export default function AppService() {
    const dispatch = useAppDispatch();

    const mainClient = new MainClient(dispatch);

    return <MainClientContext.Provider value={mainClient}>
        <App />
    </MainClientContext.Provider>
}