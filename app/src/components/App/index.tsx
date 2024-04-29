import React from "react";
import { BrowserRouter } from "react-router-dom";
import MainClient from "../../core/MainClient";
import { useAppDispatch } from "../../hooks/useGlobalState";
import Router from "../../service/Router";
import ServiceComponents from "../../service/ServiceComponents";
import store from "../../state/store";

import "./app.scss";

export const MainClientContext = React.createContext<MainClient>(undefined as never);

export default function App() {
  const dispatch = useAppDispatch();
  
  const mainClient = new MainClient({ store, dispatch });

  return (
    <div className="root">
      <MainClientContext.Provider value={mainClient}>
        <ServiceComponents />

        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </MainClientContext.Provider>
    </div>
  );
};