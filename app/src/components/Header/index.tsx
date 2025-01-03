import React from "react";
import { useNavigate } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

import useMainClient from "../../hooks/useMainClient";
import useProfile from "../../hooks/useProfile";
import { CLIENT_URL } from "../../utils/constants";
import { AVATAR_URL } from "../../utils/files";
import { Pages } from "../../types/enums";
import { UserEvents } from "../../types/events";
import Avatar from "../Common/Avatar";
import Logo from "./Logo";

import "./header.scss";

const anchorOrigin = { vertical: "top", horizontal: "left" } as const;

export default function Header() {
    const mainClient = useMainClient();
    const profile = useProfile();
    const navigate = useNavigate();

    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [avatarUrl, setAvatarUrl] = React.useState<string>(profile.user.avatarUrl);

    // Необходимо подписаться на события профиля в компоненте, иначе этот компонент не обновляется вовсе (пропсов нет, состояние не затрагивается)
    React.useEffect(() => {
        // После обновления поля пользователя необходимо добавить проверку на обновление аватара
        profile.on(UserEvents.CHANGE_FIELD, (field: string) => {
            if (field === AVATAR_URL) {
                setAvatarUrl(profile.user.avatarUrl);
            }
        });
    }, []);

    // Переход на страницу
    const goTo = (link: Pages) => {
        if (anchorElUser) setAnchorElUser(null);
        navigate(link);
    };

    // Клик по лого
    const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.button === 1) {
            window.open(CLIENT_URL);
        }
    }

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
                    <div onClick={event => setAnchorElUser(event.currentTarget)}>
                        <Avatar src={avatarUrl} alt={profile.user.fullName} />
                    </div>

                    <Menu
                        id="menu-header"
                        anchorEl={anchorElUser}
                        anchorOrigin={anchorOrigin}
                        open={Boolean(anchorElUser)}
                        autoFocus={false}
                        onClose={() => setAnchorElUser(null)}
                    >
                        <MenuItem onClick={() => goTo(Pages.settings) }>
                            <Typography variant="body2">
                                Настройки
                            </Typography>
                        </MenuItem>

                        <MenuItem onClick={() => goTo(Pages.help)}>
                            <Typography variant="body2">
                                Помощь
                            </Typography>
                        </MenuItem>

                        <MenuItem onClick={logout}>
                            <Typography variant="body2">
                                Выйти
                            </Typography>
                        </MenuItem>
                    </Menu>
                </div>
            </div>
        </div>
    </header>
};