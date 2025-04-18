import { memo } from "react";
import { useNavigate } from "react-router-dom";
import AvatarMUI from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";

import useImage from "@hooks/useImage";
import useGlobalStore from "@store/global";
import { Pages } from "@custom-types/enums";

import "./avatar.scss";

export interface IAvatarComponent {
	src: string | null;
	alt: string;
	userId: string;
	className?: "user-avatar" | "system-avatar";
	children?: React.ReactNode;
};

const anchorOrigin = { vertical: "bottom", horizontal: "right" } as const;

// Базовый компонент круглого маленького аватара
export default memo(function AvatarComponent({ src, alt, userId, className, children }: IAvatarComponent) {
	const isOnline = useGlobalStore(state => state.onlineUsers.has(userId)); 
	
	const srcImage = useImage(src);
	const navigate = useNavigate();

	// TODO Пока что сделал клик по аватару на свой профиль. В дальнейшем с добавлением других профилей будет сделан переход на них.
	const onClick = () => {
		if (window.location.pathname !== Pages.profile) {
			navigate(Pages.profile);
		}
	};

	return <Badge
		className={`avatar-badge ${isOnline ? "avatar-badge__active" : ""}`}
		overlap="circular"
		anchorOrigin={anchorOrigin}
		variant="dot"
	>
		<AvatarMUI
			src={srcImage}
			alt={alt}
			className={`avatar-badge__avatar ${className}`}
			onClick={onClick}
		>
			{children}
		</AvatarMUI>
	</Badge>;
});
