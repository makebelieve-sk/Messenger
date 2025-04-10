import Router from "@components/main/Router";
import ServiceComponents from "@components/main/ServiceComponents";
import HeaderComponent from "@components/layouts/header";
import MenuComponent from "@components/layouts/menu";
import SpinnerComponent from "@components/ui/spinner";
import { selectMainState } from "@store/main/slice";
import { useAppSelector } from "@hooks/useGlobalState";
import ContentLayout from "@components/layouts/content";

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
					<div
						className={`root__wrapper__container ${isAuth
							? ""
							: "root__wrapper__container__no-auth"
							}`}
					>
						{isAuth ? <MenuComponent /> : null}

						<ContentLayout>
							<div className="root__wrapper__container__content">
								<Router />
							</div>
						</ContentLayout>
					</div>
				</div>
			</>
		}
	</div>
}
