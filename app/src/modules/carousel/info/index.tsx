import { memo,useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import UserAvatarComponent from "@components/ui/avatar/user-avatar";
import useUser from "@hooks/useUser";
import { ICarouselImage } from "@modules/carousel/index";
import { transformDate } from "@utils/date";

import "./info.scss";

// Компонент содержит основную информацию об авторе текущего изображения
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
        <UserAvatarComponent src={activeImage.authorAvatarUrl} alt={activeImage.alt} />

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