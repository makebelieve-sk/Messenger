import React from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import { getFullName, muchSelected } from "../../../utils";
import { transformBirthday } from "../../../utils/time";
import { useAppSelector } from "../../../hooks/useGlobalState";
import useProfile from "../../../hooks/useProfile";
import { selectFriendState } from "../../../state/friends/slice";
import { selectUserState } from "../../../state/user/slice";
import { selectMainState } from "../../../state/main/slice";
import { FriendsTab, MainFriendTabs, Pages } from "../../../types/enums";
import { onClickBlockType } from "../Friends";
import Spinner from "../../../components/Common/Spinner";

import "./personal-info.scss";

interface IPersonalInfo {
    onClickBlock: onClickBlockType;
};

const NOT_COMPLITE = "Не указано";

export default React.memo(function PersonalInfo({ onClickBlock }: IPersonalInfo) {
    const {loadingUserDetails} = useAppSelector( selectMainState );
    const { user, userDetail, photosCount } = useAppSelector(selectUserState);
    const { friendsCount, subscribersCount } = useAppSelector(selectFriendState);

    // const profile = useProfile();
    // profile.user.userDetail.беру геттеры и вставоляю в этот компонент  
    const navigate = useNavigate();

    // Получаем детальную информацию о пользователе
    // React.useEffect(() => {
    //     profile.getUserDetail(setLoading);
    // }, []);

    return <Grid item>
        <Paper className="info-container paper-block">
            <div className="info-container__main-info">
                <div className="info-container__username">{getFullName(user)}</div>
            </div>

            <div className="info-container__short-info-block">
                <div className="info-container__short-info-block__edit" onClick={() => navigate(Pages.edit)}>
                    Редактировать
                </div>

                {loadingUserDetails
                    ? <Spinner />
                    : <>
                        <div className="info-container__short-info-block__row">
                            <div className="info-container__short-info-block__row__title">День рождения:</div>
                            <span>{userDetail?.birthday ? transformBirthday(userDetail.birthday) : NOT_COMPLITE}</span>
                        </div>

                        <div className="info-container__short-info-block__row">
                            <div className="info-container__short-info-block__row__title">Город:</div>
                            <span>{userDetail?.city ? userDetail.city : NOT_COMPLITE}</span>
                        </div>

                        <div className="info-container__short-info-block__row">
                            <div className="info-container__short-info-block__row__title">Место работы:</div>
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
                    <span>{friendsCount}</span> {muchSelected(friendsCount, ["друг", "друга", "друзей"])}
                </div>

                <div
                    className="counts-block__count"
                    onClick={() => onClickBlock(Pages.friends, { mainTab: MainFriendTabs.allFriends, tab: FriendsTab.subscribers })}
                >
                    <span>{subscribersCount}</span> {muchSelected(subscribersCount, ["подписчик", "подписчика", "подписчиков"])}
                </div>

                <div className="counts-block__count" onClick={() => navigate(Pages.photos)}>
                    <span>{photosCount}</span> {muchSelected(photosCount, ["фотография", "фотографии", "фотографий"])}
                </div>

                <div className="counts-block__count">
                    <span>0</span> {muchSelected(0, ["аудиозапись", "аудиозаписи", "аудиозаписей"])}
                </div>

                <div className="counts-block__count">
                    <span>0</span> {muchSelected(0, ["видеозапись", "видеозаписи", "видеозаписей"])}
                </div>
            </div>
        </Paper>
    </Grid>
});