import { memo } from "react";

import UserAvatarComponent from "@components/services/avatars/user-avatar";

import "./big-user-avatar.scss";

interface IBigUserUserAvatar {
    userId: string;
    src: string;
    alt: string;
};

// Большой аватар пользователя (используется для друзей)
export default memo(function BigUserAvatar({ userId, src, alt }: IBigUserUserAvatar) {
	return <UserAvatarComponent
		userId={userId}
		src={src}
		alt={alt}
		className="big-avatar"
	/>;
});