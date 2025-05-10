import { memo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";

import BadgeComponent from "@components/ui/badge";
import useImage from "@hooks/useImage";
import useProfile from "@hooks/useProfile";
import { Pages } from "@custom-types/enums";
import { goToAnotherProfile } from "@utils/index";

import "./avatar.scss";

interface IAvatarComponent {
	src: string | null;
	alt: string;
	userId: string;
	id?: string;
	className?: string;
	children?: ReactNode;
};

// Базовый компонент круглого маленького аватара
export default memo(function AvatarComponent({ id, src, alt, userId, className = "", children }: IAvatarComponent) {
	const srcImage = useImage(src);
	const navigate = useNavigate();
	const profile = useProfile();

	// Перенаправление на страницу профиля пользователя
	const onClick = () => {
		// Переходим только на чужой профиль
		if (profile.userService.id !== userId) {
			// encodeURIComponent необходим, чтобы в URL не было спецсимволов (мало ли в userId что-то подобное есть)
			navigate(goToAnotherProfile(Pages.profile, userId));
		}
	};

	return <BadgeComponent userId={userId}>
		<Avatar
			src={srcImage}
			alt={alt}
			id={id}
			className={`avatar ${className}`}
			onClick={onClick}
		>
			{children}
		</Avatar>
	</BadgeComponent>;
});