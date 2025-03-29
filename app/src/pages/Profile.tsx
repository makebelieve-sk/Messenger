import { useNavigate } from "react-router-dom";

import GridComponent from "@components/ui/grid";
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

    return <GridComponent container className="profile-container__grid" spacing={2}>
        <GridComponent container xs={4} spacing={2} className="column__grid" >
            {/* Блок моей фотографии */}
            <MainPhoto />

            {/* Блок друзей */}
            <Friends onClickBlock={onClickBlock} />

            {/* Блок друзей онлайн */}
            <Friends onClickBlock={onClickBlock} onlineFriends />
        </GridComponent>

        <GridComponent container xs={8} spacing={2} className="column__grid">
            {/* Блок личной информации */}
            <PersonalInfo onClickBlock={onClickBlock} />

            {/* Блок фотографий */}
            <Photos />
        </GridComponent>
    </GridComponent>
};