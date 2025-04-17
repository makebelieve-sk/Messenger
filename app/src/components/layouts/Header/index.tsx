import { MouseEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

import Logo from "@components/layouts/header/logo";
import AvatarComponent from "@components/ui/avatar";
import useMainClient from "@hooks/useMainClient";
import i18next from "@service/i18n";
import useUserStore from "@store/user";
import { Pages } from "@custom-types/enums";
import { BASE_URL } from "@utils/constants";

import "./header.scss";

const anchorOrigin = { vertical: "top", horizontal: "left" } as const;

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
		if (event.button === 1) {
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
					<Logo />
				</div>

				<div className="header-container__toolbar__avatar">
					<div onClick={(event) => setAnchorElUser(event.currentTarget)}>
						<AvatarComponent userId={userId} src={userAvatarUrl} alt={userFullname} />
					</div>

					<Menu
						id="menu-header"
						anchorEl={anchorElUser}
						anchorOrigin={anchorOrigin}
						open={Boolean(anchorElUser)}
						autoFocus={false}
						onClose={() => setAnchorElUser(null)}
					>
						<MenuItem onClick={() => goTo(Pages.settings)}>
							<Typography variant="body2">{i18next.t("header.settings")}</Typography>
						</MenuItem>

						<MenuItem onClick={() => goTo(Pages.help)}>
							<Typography variant="body2">{i18next.t("header.help")}</Typography>
						</MenuItem>

						<MenuItem onClick={logout}>
							<Typography variant="body2">{i18next.t("header.logout")}</Typography>
						</MenuItem>
					</Menu>
				</div>
			</div>
		</div>
	</header>;
}
