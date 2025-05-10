import { matchPath, useLocation } from "react-router-dom";

import { Pages } from "@custom-types/enums";

// Получение id пользователя из урла вне Route из React Router Dom
export default function useUserIdFromPath() {
	const location = useLocation();

	const match = matchPath(Pages.profileUser, location.pathname) || matchPath(Pages.photosUser, location.pathname);

	return match?.params.userId;
};