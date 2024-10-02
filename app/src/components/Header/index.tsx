import React from "react";
import { useNavigate } from "react-router-dom";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

import { CLIENT_URL } from "../../utils/constants";
import { getFullName } from "../../utils";
import {  Pages } from "../../types/enums";
import { MainClientContext } from "../../service/AppService";
import { selectUserState } from "../../state/user/slice";
import { useAppSelector } from "../../hooks/useGlobalState";
import Avatar from "../Common/Avatar";
import Logo from "./Logo";

import "./header.scss";

const anchorOrigin = { vertical: "top", horizontal: "left" } as const;

export default React.memo(function Header() {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const mainClient = React.useContext(MainClientContext);

    const { user } = useAppSelector(selectUserState);
    const navigate = useNavigate();

    // Переход на страницу
    const goTo = (link: Pages) => {
        if (anchorElUser) setAnchorElUser(null);
        navigate(link);
    };

    const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.button === 1) {
            window.open(CLIENT_URL);
        }
    }

    // Выход
    const logout = () => {
        setAnchorElUser(null);
        mainClient.logout();
    };

    return <header className="header">
        <div className="header-container">
            <div className="header-container__toolbar">
                <div className="header-container__toolbar__logo" onClick={() => goTo(Pages.profile)} onMouseDown={onMouseDown}>
                    <Logo />
                </div>

                <div className="header-container__toolbar__avatar">
                    <div onClick={event => setAnchorElUser(event.currentTarget)}>
                        <Avatar src={user.avatarUrl} alt={getFullName(user)} />
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
});