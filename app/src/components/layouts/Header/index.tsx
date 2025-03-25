import { useState, useEffect, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TypographyComponent from "@components/ui/Typography";

import AvatarComponent from "@components/ui/avatar";
import Logo from "@components/layouts/header/logo";
import useMainClient from "@hooks/useMainClient";
import useProfile from "@hooks/useProfile";
import { BASE_URL } from "@utils/constants";
import { AVATAR_URL } from "@utils/files";
import { Pages } from "@custom-types/enums";
import { UserEvents } from "@custom-types/events";

import "./header.scss";

const anchorOrigin = { vertical: "top", horizontal: "left" } as const;

// Компонент верхушки приложения. Отрисовывается на каждой странице
export default function HeaderComponent() {
    const mainClient = useMainClient();
    const profile = useProfile();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [avatarUrl, setAvatarUrl] = useState<string>(profile.user.avatarUrl);

    useEffect(() => {
        // После обновления поля пользователя необходимо добавить проверку на обновление аватара и обновлять его в состоянии
        profile.on(UserEvents.CHANGE_FIELD, onChangeField);

        // Отписываемся от данного события при размонтировании, чтобы избежать утечки памяти
        return () => {
            profile.off(UserEvents.CHANGE_FIELD, onChangeField);
        }
    }, []);

    // Коллбек события UserEvents.CHANGE_FIELD
    const onChangeField = (field: string) => {
        if (field === AVATAR_URL) {
            setAvatarUrl(profile.user.avatarUrl);
        }
    }

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
                        <AvatarComponent src={avatarUrl} alt={profile.user.fullName} />
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
                            <TypographyComponent variant="body2">
                                {t("header.settings")}
                            </TypographyComponent>
                        </MenuItem>

                        <MenuItem onClick={() => goTo(Pages.help)}>
                            <TypographyComponent variant="body2">
                                {t("header.help")}
                            </TypographyComponent>
                        </MenuItem>

                        <MenuItem onClick={logout}>
                            <TypographyComponent variant="body2">
                                {t("header.logout")}
                            </TypographyComponent>
                        </MenuItem>
                    </Menu>
                </div>
            </div>
        </div>
    </header>
};