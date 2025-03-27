import { memo } from "react";
import { useNavigate } from "react-router-dom";

import AvatarMUI from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";

import useImage from "@hooks/useImage";
import { Pages } from "@custom-types/enums";

import "./avatar.scss";

interface IAvatarComponent {
    src?: string;
    alt?: string;
    isOnline?: boolean;
    avatarClassName?: string;
    size?: number;
    pushLeft?: boolean;
    children?: React.ReactNode;
};

const anchorOrigin = { vertical: "bottom", horizontal: "right" } as const;

// Базовый компонент круглого маленького аватара
export default memo(function AvatarComponent({ children, src, alt, isOnline = false, avatarClassName, size = 46, pushLeft = false }: IAvatarComponent) {
    const srcImage = useImage(src);
    const navigate = useNavigate();

    const onClick = () => navigate(Pages.profile);

    return <Badge
        className={`avatar-badge ${isOnline ? "avatar-badge__active" : ""}`}
        overlap="circular"
        anchorOrigin={anchorOrigin}
        variant="dot"
        sx={{
            marginLeft: children ? "auto" : pushLeft ? "auto" : "50%",
            marginRight: children ? "auto" : undefined,
            transform: children ? "none" : pushLeft ? "none" : "translateX(-50%)"
        }}
    >
        <AvatarMUI
            src={children ? undefined : srcImage}
            alt={alt}
            className={`avatar-badge__avatar ${avatarClassName ? avatarClassName : ""}`}
            sx={{ width: size, height: size }}
            onClick={onClick}
        >
            {children}
        </AvatarMUI>
    </Badge>
});