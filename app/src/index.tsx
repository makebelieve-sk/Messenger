import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import store from "./state/store";

import "./styles/index.scss";

ReactDOM
  .createRoot(document.getElementById("root") as HTMLElement)
  .render(
    <Provider store={store}>
      <App />
    </Provider>
  );