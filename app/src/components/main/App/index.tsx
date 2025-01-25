import Router from "../Router";
import { useEffect, useState } from "react";
import ServiceComponents from "../ServiceComponents";
import HeaderComponent from "../../layouts/Header";
import MenuComponent from "../../layouts/Menu";
import SpinnerComponent from "../../ui/Spinner";
import { selectMainState } from "../../../store/main/slice";
import { useAppSelector } from "../../../hooks/useGlobalState";
import { UserEvents } from "../../../types/events";
import useUser from "../../../hooks/useUser";

import "./app.scss";

// Главный компонент, который отрисовывает основноую верстку проекта
export default function App() {
	const { isAuth } = useAppSelector(selectMainState);
	const [loading, setLoading] = useState(true);
	const user = useUser();
	const handleOnLoading = (isLoading: boolean) => setLoading(isLoading);

	//подписка на событие лоадинг
	useEffect(() => {
		user.on(UserEvents.SET_LOADING, handleOnLoading);

		return () => {
			user.off(UserEvents.SET_LOADING, handleOnLoading);
		};
	}, []);

	return (
		<div className="root">
			<ServiceComponents />

			{loading ? (
				<SpinnerComponent />
			) : (
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
			)}
		</div>
	);
}
