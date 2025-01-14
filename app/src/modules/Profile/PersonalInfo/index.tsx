import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import i18next from "../../../service/i18n";
import { getFullName, muchSelected } from "../../../utils";
import { transformBirthday } from "../../../utils/time";
import { useAppSelector } from "../../../hooks/useGlobalState";
import useProfile from "../../../hooks/useProfile";
import { selectFriendState } from "../../../store/friends/slice";
import { selectUserState } from "../../../store/user/slice";
import { FriendsTab, MainFriendTabs, Pages } from "../../../types/enums";
import { onClickBlockType } from "../Friends";
import SpinnerComponent from "../../../components/ui/Spinner";

import "./personal-info.scss";

interface IPersonalInfo {
    onClickBlock: onClickBlockType;
};

const NOT_COMPLITE = i18next.t("profile-module.not_complete");

export default memo(function PersonalInfo({ onClickBlock }: IPersonalInfo) {
    const [loading, setLoading] = useState(false);

    const { user, userDetail, photosCount } = useAppSelector(selectUserState);
    const { friendsCount, subscribersCount } = useAppSelector(selectFriendState);

    const { t } = useTranslation();
    const profile = useProfile();
    const navigate = useNavigate();

    // Получаем детальную информацию о пользователе
    useEffect(() => {
        profile.getUserDetail(setLoading);
    }, []);

    return <Grid item>
        <Paper className="info-container paper-block">
            <div className="info-container__main-info">
                <div className="info-container__username">{getFullName(user)}</div>
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
                            <span>{userDetail?.birthday ? transformBirthday(userDetail.birthday) : NOT_COMPLITE}</span>
                        </div>

                        <div className="info-container__short-info-block__row">
                            <div className="info-container__short-info-block__row__title">{ t("profile-module.city") }:</div>
                            <span>{userDetail?.city ? userDetail.city : NOT_COMPLITE}</span>
                        </div>

                        <div className="info-container__short-info-block__row">
                            <div className="info-container__short-info-block__row__title">{ t("profile-module.work") }:</div>
                            <span>{userDetail?.work ? userDetail.work : NOT_COMPLITE}</span>
                        </div>
                    </>
                }
            </div>

            <div className="info-container__counts-block">
                <div
                    className="counts-block__count"
                    onClick={() => onClickBlock(Pages.friends, { mainTab: MainFriendTabs.allFriends })}
                >
                    <span>{friendsCount}</span> {muchSelected(friendsCount, [t("profile-module.friends_count_0"), t("profile-module.friends_count_1"), t("profile-module.friends_count_2")])}
                </div>

                <div
                    className="counts-block__count"
                    onClick={() => onClickBlock(Pages.friends, { mainTab: MainFriendTabs.allFriends, tab: FriendsTab.subscribers })}
                >
                    <span>{subscribersCount}</span> {muchSelected(subscribersCount, [t("profile-module.subscribers_count_0"), t("profile-module.subscribers_count_1"), t("profile-module.subscribers_count_2")])}
                </div>

                <div className="counts-block__count" onClick={() => navigate(Pages.photos)}>
                    <span>{photosCount}</span> {muchSelected(photosCount, [t("profile-module.photos_count_0"), t("profile-module.photos_count_1"), t("profile-module.photos_count_2")])}
                </div>

                <div className="counts-block__count">
                    <span>0</span> {muchSelected(0, [t("profile-module.audios_count_0"), t("profile-module.audios_count_1"), t("profile-module.audios_count_2")])}
                </div>

                <div className="counts-block__count">
                    <span>0</span> {muchSelected(0, [t("profile-module.videos_count_0"), t("profile-module.videos_count_1"), t("profile-module.videos_count_2")])}
                </div>
            </div>
        </Paper>
    </Grid>
});