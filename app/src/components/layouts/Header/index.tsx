import { type MouseEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLogoIconComponent from "@components/icons/main-logo";
import UserAvatarComponent from "@components/services/avatars/user-avatar";
import MenuComponent from "@components/ui/menu";
import MenuItemComponent from "@components/ui/menu-item";
import TypographyComponent from "@components/ui/typography";
import useMainClient from "@hooks/useMainClient";
import i18n from "@service/i18n";
import useUserStore from "@store/user";
import { Pages } from "@custom-types/enums";
import { BASE_URL } from "@utils/constants";

import "./header.scss";

const anchorOrigin = { vertical: "top", horizontal: "left" } as const;
const WHEEL_CLICK_TYPE = 1;

// Компонент верхушки приложения. Отрисовывается на каждой странице
export default function HeaderComponent() {
	const mainClient = useMainClient();
	const navigate = useNavigate();

	const [ anchorElUser, setAnchorElUser ] = useState<null | HTMLElement>(null);

	const userId = useUserStore(state => state.user.id);
	const userAvatarUrl = useUserStore(state => state.user.avatarUrl);
	const userFullname = useUserStore(state => state.user.fullName);

	// Переход на страницу
	const goTo = (link: Pages) => {
		if (anchorElUser) setAnchorElUser(null);
		navigate(link);
	};

	// Клик по лого колесиком мыши
	const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
		if (event.button === WHEEL_CLICK_TYPE) {
			window.open(BASE_URL);
		}
	};

	// Выход
	const logout = () => {
		setAnchorElUser(null);
		mainClient.mainApi.logout();
	};

	return <header className="header">
		<div className="header-container">
			<div className="header-container__toolbar">
				<div className="header-container__toolbar__logo" onClick={() => goTo(Pages.profile)} onMouseDown={onMouseDown}>
					<MainLogoIconComponent />
				</div>

				<div className="header-container__toolbar__avatar">
					<div onClick={event => setAnchorElUser(event.currentTarget)}>
						<UserAvatarComponent userId={userId} src={userAvatarUrl} alt={userFullname} />
					</div>

					<MenuComponent
						anchorEl={anchorElUser}
						anchorOrigin={anchorOrigin}
						open={Boolean(anchorElUser)}
						autoFocus={false}
						onClose={() => setAnchorElUser(null)}
					>
						<MenuItemComponent onClick={() => goTo(Pages.settings)}>
							<TypographyComponent variant="body2">
								{i18n.t("header.settings")}
							</TypographyComponent>
						</MenuItemComponent>

						<MenuItemComponent onClick={() => goTo(Pages.help)}>
							<TypographyComponent variant="body2">
								{i18n.t("header.help")}
							</TypographyComponent>
						</MenuItemComponent>

						<MenuItemComponent onClick={logout}>
							<TypographyComponent variant="body2">
								{i18n.t("header.logout")}
							</TypographyComponent>
						</MenuItemComponent>
					</MenuComponent>
				</div>
			</div>
		</div>
	</header>;
};
