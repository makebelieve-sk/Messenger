import { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";

import GridComponent from "@components/ui/Grid";
import PaperComponent from "@components/ui/Paper";
import AvatarComponent from "@components/ui/avatar";
import NoDataComponent from "@components/ui/no-data";
import SpinnerComponent from "@components/ui/spinner";
import { FriendsTab, MainFriendTabs, Pages } from "@custom-types/enums";
import { IUser } from "@custom-types/models.types";
import { useAppSelector } from "@hooks/useGlobalState";
import useProfile from "@hooks/useProfile";
import { selectMainState } from "@store/main/slice";
import { selectFriendState } from "@store/friend/slice";
import { getFullName } from "@utils/index";

import "./friends.scss";

export type onClickBlockType = (
    pathname: Pages,
    query: {
        mainTab: MainFriendTabs;
        tab?: FriendsTab;
    }
) => void;

interface IFriends {
    onlineFriends?: boolean;
    onClickBlock: onClickBlockType;
};

interface IFriendsState {
    title: string;
    count: number | string;
    users: IUser[] | null;
};

export default memo(function Friends({ onlineFriends = false, onClickBlock }: IFriends) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [friendsState, setFriendsState] = useState<IFriendsState>({
        title: t("profile-module.friends"),
        count: "-",
        users: null
    });

    const { topFriends, friendsCount } = useAppSelector(selectFriendState);
    const { onlineUsers } = useAppSelector(selectMainState);

    const profile = useProfile();

    // Формируем объект данных компонента
    useEffect(() => {
        const state = {
            title: onlineFriends ? t("profile-module.friends_online") : t("profile-module.friends"),
            count: onlineFriends ? onlineUsers.length : friendsCount,
            users: onlineFriends ? onlineUsers.slice(0, 6) : topFriends
        };

        setFriendsState(state);
    }, [onlineFriends, onlineUsers, topFriends, friendsCount]);

    // Получаем количество друзей, подписчиков и подгружаем первые 6 из них
    useEffect(() => {
        if (!onlineFriends) {
            profile.getFriends(setLoading);
        }
    }, []);

    // Обрабока клика по блоку
    const blockHandler = () => {
        const params: { mainTab: MainFriendTabs; tab?: FriendsTab; } = { mainTab: MainFriendTabs.allFriends };

        if (onlineFriends) {
            params.tab = FriendsTab.online;
        }

        onClickBlock(Pages.friends, params);
    };

    const { title, count, users } = friendsState;

    return <GridComponent className="friends-container__grid">
        <PaperComponent className="friends-container paper-block">
            <div className="block-title" onClick={blockHandler}>
                {title} <span className="counter">{count}</span>
            </div>

            {loading
                ? <SpinnerComponent />
                : users && users.length
                    ? <List className="friends-container__top-friends__list">
                        {users.map(user => {
                            const userName = getFullName(user);

                            return <ListItem className="friends-container__top-friends__item" key={user.id}>
                                <ListItemAvatar className="friends-container__top-friends__item__avatar-block">
                                    <AvatarComponent
                                        src={user.avatarUrl}
                                        alt={userName}
                                        isOnline={Boolean(onlineUsers.find(onlineUser => onlineUser.id === user.id))}
                                        size={50}
                                    />
                                </ListItemAvatar>

                                {user.firstName}
                            </ListItem>
                        })}
                    </List>
                    : <NoDataComponent text={t("profile-module.no_data", { isOnline: onlineFriends ? t("profile-module.online") : "" })} />
            }
        </PaperComponent>
    </GridComponent>
});