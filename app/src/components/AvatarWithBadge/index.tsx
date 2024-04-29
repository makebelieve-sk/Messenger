import React from "react";
import { redirect } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import { Pages } from "../../types/enums";

import "./avatar-with-badge.scss";

interface IAvatarWithBadge {
    chatAvatar: string;
    alt: string;
    isOnline: boolean;
    avatarClassName?: string;
    size?: number;
    pushLeft?: boolean;
};

export default React.memo(function AvatarWithBadge({ alt, chatAvatar, isOnline, avatarClassName, size = 46, pushLeft = false }: IAvatarWithBadge) {
    return <Badge
        className={`"avatar-badge" ${isOnline ? "avatar-badge__active" : ""}`}
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        variant="dot"
        sx={{ marginLeft: pushLeft ? "auto" : "50%", transform: pushLeft ? "none" : "translateX(-50%)" }}
    >
        <Avatar 
            alt={alt} 
            src={chatAvatar} 
            className={`"avatar-badge__avatar" ${avatarClassName ? avatarClassName : ""}`} 
            sx={{ width: size, height: size }}
            onClick={() => redirect(Pages.profile)} 
        />
    </Badge>
});