import { useEffect, useState } from "react";

import Router from "@components/main/Router";
import ServiceComponents from "@components/main/ServiceComponents";
import HeaderComponent from "@components/layouts/header";
import MenuComponent from "@components/layouts/menu";
import SpinnerComponent from "@components/ui/spinner";
import { selectMainState } from "@store/main/slice";
import { useAppSelector } from "@hooks/useGlobalState";
import useUser from "@hooks/useUser";
import { UserEvents } from "@custom-types/events";

import "./app.scss";

// Главный компонент, который отрисовывает основноую верстку проекта
export default function App() {
	const [loading, setLoading] = useState(true);

	const { isAuth } = useAppSelector(selectMainState);
	const user = useUser();

	//подписка на событие лоадинг
	useEffect(() => {
		user.on(UserEvents.SET_LOADING, handleOnLoading);

		return () => {
			user.off(UserEvents.SET_LOADING, handleOnLoading);
		};
	}, []);

	// Обрабочик на событие UserEvents.SET_LOADING
	const handleOnLoading = (isLoading: boolean) => setLoading(isLoading);

	return (
		<div className="root">
			<ServiceComponents />

			{loading ? 
				<SpinnerComponent />
			 : 
				<>
					{isAuth ? <HeaderComponent /> : null}

					<div className="root__wrapper">
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
	);
}
