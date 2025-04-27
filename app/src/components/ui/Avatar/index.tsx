import { memo } from "react";
import { useNavigate } from "react-router-dom";
import AvatarMUI from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";

import useImage from "@hooks/useImage";
import { Pages } from "@custom-types/enums";

import "./avatar.scss";

export interface IAvatarComponent {
    src?: string;
    alt?: string;
    isOnline?: boolean;
    children?: React.ReactNode;
    className?: "user-avatar" | "system-avatar";
};

const anchorOrigin = { vertical: "bottom", horizontal: "right" } as const;

// Базовый компонент круглого маленького аватара
export default memo(function AvatarComponent({ children, src, alt, isOnline = false, className }: IAvatarComponent) {
    const srcImage = children ? undefined : useImage(src);
    const navigate = useNavigate();

    const onClick = () => navigate(Pages.profile);

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
            data-testid="avatar"
            onClick={onClick}
        >
            {children}
        </AvatarMUI>
    </Badge>
});


