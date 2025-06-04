import useAuthStore from "@store/auth";
import useFriendsStore from "@store/friends";
import useGlobalStore from "@store/global";
import useImagesCarouselStore from "@store/images-carousel";
import usePhotosStore from "@store/photos";
import useProfileStore from "@store/profile";
import useUIStore from "@store/ui";
import useUserStore from "@store/user";

// Обнуление всех состояний
const resetAllStores = () => {
	useUserStore.getState().reset();
	useGlobalStore.getState().reset();
	useUIStore.getState().reset();
	useImagesCarouselStore.getState().reset();
	useAuthStore.getState().reset();
	useProfileStore.getState().reset();
	usePhotosStore.getState().reset();
	useFriendsStore.getState().reset();
};

export default resetAllStores;