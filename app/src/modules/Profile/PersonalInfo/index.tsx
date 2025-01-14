import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import useProfile from "../../../hooks/useProfile";
import useUser from "../../../hooks/useUser";
import useUserDetails from "../../../hooks/useUserDetails";
import { useAppSelector } from "../../../hooks/useGlobalState";
import { selectFriendState } from "../../../store/friends/slice";
import { selectUserState } from "../../../store/user/slice";
import { FriendsTab, MainFriendTabs, Pages } from "../../../types/enums";
import { onClickBlockType } from "../Friends";
import SpinnerComponent from "../../../components/ui/Spinner";

import "./personal-info.scss";

interface IPersonalInfo {
    onClickBlock: onClickBlockType;
};

export default memo(function PersonalInfo({ onClickBlock }: IPersonalInfo) {
    const [loading, setLoading] = useState(false);

    const { photosCount } = useAppSelector(selectUserState);
    const { friendsCount, subscribersCount } = useAppSelector(selectFriendState);

    const { t } = useTranslation();
    const profile = useProfile();
    const { fullName } = useUser();
    const userDetails = useUserDetails();
    const navigate = useNavigate();

    // Получаем детальную информацию о пользователе
    useEffect(() => {
        profile.getUserDetail(setLoading);
    }, []);

    return <Grid item>
        <Paper className="info-container paper-block">
            <div className="info-container__main-info">
                <div className="info-container__username">{fullName}</div>
            </div>

            <div className="info-container__short-info-block">
                <div className="info-container__short-info-block__edit" onClick={() => navigate(Pages.edit)}>
                    { t("profile-module.edit") }
                </div>

                {loading
                    ? <SpinnerComponent />
                    : <>
                        <div className="info-container__short-info-block__row">
                            <div className="info-container__short-info-block__row__title">{ t("profile-module.birthday") }:</div>
                            <span>{userDetails.birthday}</span>
                        </div>

                        <div className="info-container__short-info-block__row">
                            <div className="info-container__short-info-block__row__title">{ t("profile-module.city") }:</div>
                            <span>{userDetails.city}</span>
                        </div>

                        <div className="info-container__short-info-block__row">
                            <div className="info-container__short-info-block__row__title">{ t("profile-module.work") }:</div>
                            <span>{userDetails.work}</span>
                        </div>
                    </>
                }
            </div>

            <div className="info-container__counts-block">
                <div
                    className="counts-block__count"
                    onClick={() => onClickBlock(Pages.friends, { mainTab: MainFriendTabs.allFriends })}
                >
                    <span>{friendsCount}</span> {userDetails.getFriendsText(friendsCount)}
                </div>

                <div
                    className="counts-block__count"
                    onClick={() => onClickBlock(Pages.friends, { mainTab: MainFriendTabs.allFriends, tab: FriendsTab.subscribers })}
                >
                    <span>{subscribersCount}</span> {userDetails.getSubscribersText(subscribersCount)}
                </div>

                <div className="counts-block__count" onClick={() => navigate(Pages.photos)}>
                    <span>{photosCount}</span> {userDetails.getPhotosText(photosCount)}
                </div>

                <div className="counts-block__count">
                    <span>0</span> {userDetails.getAudiosText(0)}
                </div>

                <div className="counts-block__count">
                    <span>0</span> {userDetails.getVideosText(0)}
                </div>
            </div>
        </Paper>
    </Grid>
});