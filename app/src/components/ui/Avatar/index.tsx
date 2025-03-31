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
    children?: React.ReactNode;
};

const anchorOrigin = { vertical: "bottom", horizontal: "right" } as const;

// Базовый компонент круглого маленького аватара
export default memo(function AvatarComponent({ children, src, alt, isOnline = false, avatarClassName, size = 46 }: IAvatarComponent) {
    const srcImage = useImage(src);
    const navigate = useNavigate();

    const onClick = () => navigate(Pages.profile);

    const avatarStyle = {
        width: `${size}px`,
        height: `${size}px`,
    };

    return <Badge
        className={`avatar-badge ${isOnline ? "avatar-badge__active" : ""} ${children ? "avatar-badge__children" : "avatar-badge__children-none"}`}
        overlap="circular"
        anchorOrigin={anchorOrigin}
        variant="dot"
    >
        <AvatarMUI 
            src={srcImage} 
            alt={alt}
            className={`avatar-badge__avatar ${avatarClassName ? avatarClassName : ""}`} 
            style={avatarStyle}
            onClick={onClick} 
        />
    </Badge>
});