import { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";

import useUser from "../../../hooks/useUser";
import AvatarComponent from "../../../components/ui/Avatar";
import { transformDate } from "../../../utils/time";

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

    const { t } = useTranslation();
    const user = useUser();

    useEffect(() => {
        setName(user.fullName === activeImage.authorName
            ? t("images-carousel-module.you")
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