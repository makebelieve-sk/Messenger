import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";

import NotificationBadge from "@components/services/badges/notification-badge";
import MenuItemComponent from "@components/ui/menu-item";
import MenuListComponent from "@components/ui/menu-list";
import useMainClient from "@hooks/useMainClient";
import i18n from "@service/i18n";
import { Pages } from "@custom-types/enums";

import "./menu.scss";

// Компонент главного меню. Отрисовывается на каждой странице
export default function MenuComponent() {
	const { mainApi } = useMainClient();
	const navigate = useNavigate();

	// Получаем уведомления для отрисовки в Badge
	useEffect(() => {
		// Уведомления для друзей
		mainApi.getFriendsNotification();

		// Уведомления для сообщений
		mainApi.getMessageNotification();
	}, []);

	// При изменении непрочитанных сообщений в чатах изменяем количество чатов, содержащих непрочитанные сообщения
	// useEffect(() => {
	//     const unReadChats = Object.keys(unRead);

	//     dispatch(setMessageNotification(unReadChats.length));
	// }, [unRead]);

	// Обработка клика по пункту "Друзья"
	// const onClickFriends = () => {
	//     navigate({ pathname: Pages.friends, query: { mainTab: MainFriendTabs.allFriends, tab: FriendsTab.all } });
	// };

	return <div className="menu">
		<nav className="menu__nav">
			<MenuListComponent>
				<MenuItemComponent className="menu__nav__item" onClick={() => navigate(Pages.profile)}>
					<AccountCircleOutlinedIcon color="primary" />

					<div className="menu__nav__item__title">
						{i18n.t("menu.profile")}
					</div>
				</MenuItemComponent>

				<MenuItemComponent className="menu__nav__item" onClick={() => navigate(Pages.messages)}>
					<MessageOutlinedIcon color="primary" />

					<div className="menu__nav__item__title">
						{i18n.t("menu.messanger")}
					</div>

					<NotificationBadge content={0} />
				</MenuItemComponent>

				<MenuItemComponent className="menu__nav__item" onClick={() => navigate(Pages.friends)}>
					<PeopleOutlinedIcon color="primary" />
                    
					<div className="menu__nav__item__title">
						{i18n.t("menu.friends")}
					</div>

					<NotificationBadge content={0} />
				</MenuItemComponent>

				<MenuItemComponent className="menu__nav__item" onClick={() => navigate(Pages.photos)}>
					<CameraAltIcon color="primary" />
                    
					<div className="menu__nav__item__title">
						{i18n.t("menu.photos")}
					</div>
				</MenuItemComponent>
			</MenuListComponent>
		</nav>

		<div className="menu__down-info">
			{i18n.t("menu.to-developers")}
		</div>
	</div>;
};