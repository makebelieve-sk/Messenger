import React from "react";

import { transformDate } from "../../utils/time";
import { useAppSelector } from "../../hooks/useGlobalState";
import { selectUserState } from "../../state/user/slice";
import { getFullName } from "../../utils";
import Avatar from "../../components/Common/Avatar";

import "./info.scss";

export interface ICarouselImage {
    src: string;
    authorName: string;
    dateTime: string;
    authorAvatarUrl: string;
    alt: string;
};

export default React.memo(function Info({ activeImage }: { activeImage: ICarouselImage; }) {
    const [name, setName] = React.useState("");
    const [createDate, setCreateDate] = React.useState("");

    const { user } = useAppSelector(selectUserState);

    React.useEffect(() => {
        setName(user && getFullName(user) === activeImage.authorName
            ? "Вы"
            : activeImage.authorName
        );
    }, [activeImage.authorName]);

    React.useEffect(() => {
        if (activeImage.dateTime) {
            setCreateDate(transformDate(activeImage.dateTime, true));
        }
    }, [activeImage.dateTime]);

    return <div className="info">
        <Avatar src={activeImage.authorAvatarUrl} alt={activeImage.alt} />

        <div className="info__container">
            <div className="info__container__user-name">
                {name}
            </div>

            <div className="info__container__date-time">
                {createDate}
            </div>
        </div>
    </div>
});