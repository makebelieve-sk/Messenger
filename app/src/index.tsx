import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";

import AppService from "@components/main/Main";
import store from "@store/index";
import "@service/i18n";

import "@styles/index.scss";

createRoot(document.getElementById("root") as HTMLElement)
  .render(
    <BrowserRouter>
      <Provider store={store}>
        <AppService />
      </Provider>
    </BrowserRouter>
  );