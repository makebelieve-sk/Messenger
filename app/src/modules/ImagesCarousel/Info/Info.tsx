import { useState, useEffect, memo } from "react";

import { transformDate } from "../../../utils/time";
import { useAppSelector } from "../../../hooks/useGlobalState";
import { selectUserState } from "../../../store/user/slice";
import { getFullName } from "../../../utils";
import AvatarComponent from "../../../components/ui/Avatar";

import "./info.scss";

export interface ICarouselImage {
    src: string;
    authorName: string;
    dateTime: string;
    authorAvatarUrl: string;
    alt: string;
};

export default memo(function Info({ activeImage }: { activeImage: ICarouselImage; }) {
    const [name, setName] = useState("");
    const [createDate, setCreateDate] = useState("");

    const { user } = useAppSelector(selectUserState);

    useEffect(() => {
        setName(user && getFullName(user) === activeImage.authorName
            ? "Вы"
            : activeImage.authorName
        );
    }, [activeImage.authorName]);

    useEffect(() => {
        if (activeImage.dateTime) {
            setCreateDate(transformDate(activeImage.dateTime, true));
        }
    }, [activeImage.dateTime]);

    return <div className="info">
        <AvatarComponent src={activeImage.authorAvatarUrl} alt={activeImage.alt} />

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