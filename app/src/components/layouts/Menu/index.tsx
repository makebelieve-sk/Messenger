import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Stack from "@mui/material/Stack";

import useMainClient from "@hooks/useMainClient";
import i18next from "@service/i18n";
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

	return <div id="menu" className="menu">
		<Stack direction="column" spacing={2}>
			<nav className="menu__nav">
				<MenuList id="list" className="menu__nav__list">
					<MenuItem onClick={() => navigate(Pages.profile)} className="menu__nav__list__item">
						<AccountCircleOutlinedIcon color="primary" />

						<div className="menu__nav__list__item__title">
							{i18next.t("menu.profile")}
						</div>
					</MenuItem>

					<MenuItem onClick={() => navigate(Pages.messages)} className="menu__nav__list__item">
						<MessageOutlinedIcon color="primary" />

						<div className="menu__nav__list__item__title">
							{i18next.t("menu.messanger")}
						</div>

						<Badge color="default" badgeContent={0 || null} className="menu__nav__list__item__badge" />
					</MenuItem>

					<MenuItem onClick={() => navigate(Pages.friends)} className="menu__nav__list__item">
						<PeopleOutlinedIcon color="primary" />

						<div className="menu__nav__list__item__title">
							{i18next.t("menu.friends")}
						</div>

						<Badge color="default" badgeContent={0 || null} className="menu__nav__list__item__badge" />
					</MenuItem>
				</MenuList>
			</nav>

			<div className="menu__down-info">{i18next.t("menu.to-developers")}</div>
		</Stack>
	</div>;
}
