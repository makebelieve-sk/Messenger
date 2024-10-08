import React from "react";

import { selectMainState } from "../../state/main/slice";
import { useAppSelector } from "../../hooks/useGlobalState";
import Router from "../../service/Router";
import ServiceComponents from "../../service/ServiceComponents";
import Header from "../Header";
import MenuComponent from "../Menu";
import Spinner from "../Common/Spinner";

import "./app.scss";

export default React.memo(function App() {
  const { isAuth, loading } = useAppSelector(selectMainState);

  return <div className="root">
    <ServiceComponents />

    {loading
      ? <Spinner />
      : <>
        {isAuth ? <Header /> : null}

        <div className="root__wrapper">
          <div className={`root__wrapper__container ${isAuth ? "" : "root__wrapper__container__no-auth"}`}>
            {isAuth ? <MenuComponent /> : null}

            <div className="root__wrapper__container__content">
              <Router />
            </div>
          </div>
        </div>
      </>
    }
  </div>
});