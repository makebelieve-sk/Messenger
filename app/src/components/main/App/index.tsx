import ContentLayoutComponent from "@components/layouts/content";
import HeaderComponent from "@components/layouts/header";
import MenuComponent from "@components/layouts/menu";
import Router from "@components/main/Router";
import ServiceComponents from "@components/main/ServiceComponents";
import SpinnerComponent from "@components/ui/spinner";
import useUserStore from "@store/user";

import "./app.scss";

// Главный компонент, который отрисовывает основную верстку проекта
export default function App() {
	const isLoading = useUserStore(state => state.isUserLoading);
	const user = useUserStore(state => state.user);

	return <div className="root">
		<ServiceComponents isAuth={Boolean(user)} />

		{isLoading
			? <SpinnerComponent />
			: <>
				{user ? <HeaderComponent /> : null}

				<div className="root__wrapper">
					<div className={`root__wrapper__container ${user ? "" : "root__wrapper__container__no-auth" }`}>
						{user ? <MenuComponent /> : null}

						<ContentLayoutComponent>
							<div className="root__wrapper__container__content">
								<Router isAuth={Boolean(user)} />
							</div>
						</ContentLayoutComponent>
					</div>
				</div>
			</>
		}
	</div>;
}
