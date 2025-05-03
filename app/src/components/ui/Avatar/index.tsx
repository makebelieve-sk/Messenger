import { memo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";

import BadgeComponent from "@components/ui/badge";
import useImage from "@hooks/useImage";
import { Pages } from "@custom-types/enums";

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

	const onClick = () => {
		if (window.location.pathname !== Pages.profile) {
			navigate(Pages.profile);
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