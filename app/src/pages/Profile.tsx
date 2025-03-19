import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";

import { Pages } from "@custom-types/enums";
import MainPhoto from "@modules/profile/main-photo";
import Friends from "@modules/profile/friends";
import PersonalInfo from "@modules/profile/personal-info";
import Photos from "@modules/profile/photos";

import "@styles/pages/profile.scss";

export default function Profile() {
    const navigate = useNavigate();

    // Клик по названию блока
    const onClickBlock = (pathname: Pages) => {
        // второй параметр query: { mainTab: MainFriendTabs, tab?: FriendsTab }
        // navigate({ pathname, query });
        navigate(pathname);
    };

    return <Grid container spacing={2} sx={{ flexWrap: "nowrap" }} >
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
};