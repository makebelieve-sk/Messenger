import React from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Paper from "@mui/material/Paper";

import { FriendsTab, MainFriendTabs, Pages } from "../../../types/enums";
import { IUser } from "../../../types/models.types";
import { useAppSelector } from "../../../hooks/useGlobalState";
import useProfile from "../../../hooks/useProfile";
import { selectMainState } from "../../../state/main/slice";
import { selectFriendState } from "../../../state/friends/slice";
import { getFullName } from "../../../utils";
import Avatar from "../../../components/Common/Avatar";
import NoItems from "../../../components/Common/NoItems";
import Spinner from "../../../components/Common/Spinner";

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

export default React.memo(function Friends({ onlineFriends = false, onClickBlock }: IFriends) {
    const [loading, setLoading] = React.useState(false);
    const [friendsState, setFriendsState] = React.useState<IFriendsState>({
        title: "Друзья",
        count: "-",
        users: null
    });

    const { topFriends, friendsCount } = useAppSelector(selectFriendState);
    const { onlineUsers } = useAppSelector(selectMainState);

    const profile = useProfile();

    // Формируем объект данных компонента
    React.useEffect(() => {
        const state = {
            title: onlineFriends ? "Друзья онлайн" : "Друзья",
            count: onlineFriends ? onlineUsers.length : friendsCount,
            users: onlineFriends ? onlineUsers.slice(0, 6) : topFriends
        };
        
        setFriendsState(state);
    }, [onlineFriends, onlineUsers, topFriends, friendsCount]);

    // Получаем количество друзей, подписчиков и подгружаем первые 6 из них
    React.useEffect(() => {
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

    return <Grid item>
        <Paper className="friends-container paper-block">
            <div className="block-title" onClick={blockHandler}>
                {title} <span className="counter">{count}</span>
            </div>

            {loading
                ? <Spinner />
                : users && users.length
                    ? <List className="friends-container__top-friends__list">
                        {users.map(user => {
                            const userName = getFullName(user);

                            return <ListItem className="friends-container__top-friends__item" key={user.id}>
                                <ListItemAvatar className="friends-container__top-friends__item__avatar-block">
                                    <Avatar
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
                    : <NoItems text={`На данный момент список друзей${onlineFriends ? " онлайн" : ""} пуст`} />
            }
        </Paper>
    </Grid>
});