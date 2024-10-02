import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import AppService from "./service/AppService";
import store from "./state/store";

import "./styles/index.scss";

ReactDOM
  .createRoot(document.getElementById("root") as HTMLElement)
  .render(
    <BrowserRouter>
      <Provider store={store}>
        <AppService />
      </Provider>
    </BrowserRouter>
  );