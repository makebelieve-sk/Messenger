import Router from "@components/main/Router";
import ServiceComponents from "@components/main/ServiceComponents";
import HeaderComponent from "@components/layouts/header";
import MenuComponent from "@components/layouts/menu";
import SpinnerComponent from "@components/ui/spinner";
import { selectMainState } from "@store/main/slice";
import { useAppSelector } from "@hooks/useGlobalState";

import "./app.scss";

// Главный компонент, который отрисовывает основную верстку проекта
export default function App() {
	const { isAuth, loading } = useAppSelector(selectMainState);
	
	return <div className="root">
		<ServiceComponents />

		{loading
			? <SpinnerComponent />
			: <>
				{isAuth ? <HeaderComponent /> : null}

				<div className="root__wrapper">
					{/* <button onClick={() => setIsDarkMode((prev: boolean) => !prev)}>Toggle Theme</button> */}
					<div
						className={`root__wrapper__container ${
							isAuth
								? ""
								: "root__wrapper__container__no-auth"
						}`}
					>
						{isAuth ? <MenuComponent /> : null}

						<div className="root__wrapper__container__content">
							<Router />
						</div>
					</div>
				</div>
			</>
		}
	</div>
}
