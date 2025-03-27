import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Stack from "@mui/material/Stack";
import MenuList from "@mui/material/MenuList";
import Badge from "@mui/material/Badge";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";

import MenuItemComponent from "@components/ui/MenuItem";
import useMainClient from "@hooks/useMainClient";
import { useAppDispatch, useAppSelector } from "@hooks/useGlobalState";
import { selectMainState, setMessageNotification } from "@store/main/slice";
import { selectMessagesState } from "@store/message/slice";
import { Pages } from "@custom-types/enums";

import "./menu.scss";

// Компонент главного меню. Отрисовывается на каждой странице
export default function MenuComponent() {
    const { mainApi } = useMainClient();
    const { t } = useTranslation();
    const { friendNotification, messageNotification } = useAppSelector(selectMainState);
    const { unRead } = useAppSelector(selectMessagesState);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Получаем уведомления для отрисовки в Badge
    useEffect(() => {
        // Уведомления для друзей
        mainApi.getFriendsNotification();

        // Уведомления для сообщений
        mainApi.getMessageNotification();
    }, []);

    // При изменении непрочитанных сообщений в чатах изменяем количество чатов, содержащих непрочитанные сообщения
    useEffect(() => {
        const unReadChats = Object.keys(unRead);

        dispatch(setMessageNotification(unReadChats.length));
    }, [unRead]);

    // Обработка клика по пункту "Друзья"
    // const onClickFriends = () => {
    //     navigate({ pathname: Pages.friends, query: { mainTab: MainFriendTabs.allFriends, tab: FriendsTab.all } });
    // };

    return <div id="menu" className="menu">
        <Stack direction="column" spacing={2}>
            <nav>
                <MenuList id="list" className="menu__list">
                    <MenuItemComponent onClick={() => navigate(Pages.profile)} className="menu__list__item">
                        <AccountCircleOutlinedIcon color="primary" />
                        <div>{ t("menu.profile") }</div>
                    </MenuItemComponent>

                    <MenuItemComponent onClick={() => navigate(Pages.messages)} className="menu__list__item">
                        <MessageOutlinedIcon color="primary" />
                        <div>{ t("menu.messanger") }</div>
                        <Badge
                            color="default"
                            badgeContent={messageNotification || null}
                            className="menu__list__item__badge"
                        />
                    </MenuItemComponent>

                    <MenuItemComponent onClick={() => navigate(Pages.friends)} className="menu__list__item">
                        <PeopleOutlinedIcon color="primary" />
                        <div>{ t("menu.friends") }</div>
                        <Badge 
                            color="default" 
                            badgeContent={friendNotification || null} 
                            className="menu__list__item__badge" 
                        />
                    </MenuItemComponent>
                </MenuList>
            </nav>

            <div className="menu__down-info">
                { t("menu.to-developers") }
            </div>
        </Stack>
    </div>
};