import { memo } from "react";

import Router from "../Router";
import ServiceComponents from "../ServiceComponents";
import HeaderComponent from "../../layouts/Header";
import MenuComponent from "../../layouts/Menu";
import SpinnerComponent from "../../ui/Spinner";
import { selectMainState } from "../../../store/main/slice";
import { useAppSelector } from "../../../hooks/useGlobalState";

import "./app.scss";

export default memo(function App() {
  const { isAuth, loading } = useAppSelector(selectMainState);

  return <div className="root">
    <ServiceComponents />

    {loading
      ? <SpinnerComponent />
      : <>
        {isAuth ? <HeaderComponent /> : null}

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