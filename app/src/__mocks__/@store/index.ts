import useAuthStore from "./auth";
import useGlobalStore from "./global";
import useImagesCarouselStore from "./images-carousel";
import usePhotosStore from "./photos";
import useProfileStore from "./profile";
import useUIStore from "./ui";
import useUserStore from "./user";

const resetAllStores = jest.fn(() => {
	useUserStore.getState().reset();
	useGlobalStore.getState().reset();
	useUIStore.getState().reset();
	useImagesCarouselStore.getState().reset();
	useAuthStore.getState().reset();
	useProfileStore.getState().reset();
	usePhotosStore.getState().reset();
});

export default resetAllStores; 