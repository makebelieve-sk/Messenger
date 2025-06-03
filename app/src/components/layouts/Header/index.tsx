import { type MouseEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLogoIconComponent from "@components/icons/main-logo";
import UserAvatarComponent from "@components/services/avatars/user-avatar";
import MenuComponent from "@components/ui/menu";
import MenuItemComponent from "@components/ui/menu-item";
import TypographyComponent from "@components/ui/typography";
import useMainClient from "@hooks/useMainClient";
import i18n from "@service/i18n";
import useUIStore from "@store/ui";
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

	const myAvatar = useUserStore(state => state.myAvatar);

	// Открытие меню
	const onOpenMenu = (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
		/**
		 * Обязательно останавливаем погружение события клика ниже к аватару, чтобы именно на этом компоненте
		 * не происходил переход на страницу профиля (поведение по умолчанию у аватара).
		 * Поэтому обработчик onClickCapture (то есть срабатывает только на фазе погружения события). И мы запрещаем ему 
		 * спускаться ниже до дочернего компонента.
		 */
		event.stopPropagation();
		setAnchorElUser(event.currentTarget);
	};

	// Открытие модального окна "Настройки"
	const openSettingsModal = () => {
		closeMenu();
		useUIStore.getState().setSettingsModal(true);
	};

	// Переход на страницу
	const goTo = (link: Pages) => {
		if (anchorElUser) closeMenu();
		navigate(link);
	};

	// Клик по лого колесиком мыши
	const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
		if (event.button === WHEEL_CLICK_TYPE) {
			window.open(BASE_URL);
		}
	};

	// Закрытие меню
	const closeMenu = () => setAnchorElUser(null);

	// Выход
	const logout = () => {
		closeMenu();
		mainClient.mainApi.logout();
	};

	return <header className="header" data-testid="header">
		<div className="header-container">
			<div className="header-container__toolbar">
				<div className="header-container__toolbar__logo" onClick={() => goTo(Pages.profile)} onMouseDown={onMouseDown}>
					<MainLogoIconComponent />
				</div>

				<div className="header-container__toolbar__avatar">
					<div onClickCapture={onOpenMenu}>
						<UserAvatarComponent userId={myAvatar.userId} src={myAvatar.src} alt={myAvatar.alt} />
					</div>

					<MenuComponent
						anchorEl={anchorElUser}
						anchorOrigin={anchorOrigin}
						open={Boolean(anchorElUser)}
						autoFocus={false}
						onClose={closeMenu}
					>
						<MenuItemComponent onClick={openSettingsModal}>
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