import React from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

import { FriendsTab, MainFriendTabs, Pages } from "../types/enums";
import MainPhoto from "../modules/Profile/MainPhoto";
import Friends from "../modules/Profile/Friends";
import PersonalInfo from "../modules/Profile/PersonalInfo";
import Photos from "../modules/Profile/Photos";

export default React.memo(function Profile() {
    const navigate = useNavigate();

    // Клик по названию блока
    const onClickBlock = (pathname: Pages, query: { mainTab: MainFriendTabs, tab?: FriendsTab }) => {
        // navigate({ pathname, query });
        navigate(pathname);
    };

    return <Grid container spacing={2}>
        <Grid item container xs={4} spacing={2} direction="column">
            {/* Блок моей фотографии */}
            <MainPhoto />

            {/* Блок друзей */}
            <Friends onClickBlock={onClickBlock} />

            {/* Блок друзей онлайн */}
            <Friends onClickBlock={onClickBlock} onlineFriends />
        </Grid>

        <Grid item container xs={8} spacing={2} direction="column">
            {/* Блок личной информации */}
            <PersonalInfo onClickBlock={onClickBlock} />

            {/* Блок фотографий */}
            <Photos />
        </Grid>
    </Grid>
});