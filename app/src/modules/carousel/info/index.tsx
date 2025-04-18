import { memo, useEffect, useState } from "react";

import UserAvatarComponent from "@components/ui/avatar/user-avatar";
import type { ICarouselImage } from "@modules/carousel/index";
import i18next from "@service/i18n";
import useUserStore from "@store/user";
import { transformDate } from "@utils/date";

import "./info.scss";

// Компонент содержит основную информацию об авторе текущего изображения
export default memo(function Info({ activeImage }: { activeImage: ICarouselImage; }) {
	const [ name, setName ] = useState("");
	const [ createDate, setCreateDate ] = useState("");

	const userId = useUserStore(state => state.user.id);
	const fullName = useUserStore(state => state.user.fullName);

	useEffect(() => {
		setName(fullName === activeImage.authorName 
			? i18next.t("images-carousel-module.you") 
			: activeImage.authorName,
		);
	}, [ activeImage.authorName ]);

	useEffect(() => {
		if (activeImage.dateTime) {
			setCreateDate(transformDate(activeImage.dateTime, true));
		}
	}, [ activeImage.dateTime ]);

	return <div className="info">
		<UserAvatarComponent userId={userId} src={activeImage.authorAvatarUrl} alt={activeImage.alt} />

		<div className="info__container">
			<div className="info__container__user-name">
				{name}
			</div>

			<div className="info__container__date-time">
				{createDate}
			</div>
		</div>
	</div>;
});
