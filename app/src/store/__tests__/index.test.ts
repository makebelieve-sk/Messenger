import useAuthStore from "../auth";
import useFriendsStore from "../friends";
import useGlobalStore from "../global";
import useImagesCarouselStore from "../images-carousel";
import resetAllStores from "../index";
import usePhotosStore from "../photos";
import useProfileStore from "../profile";
import useUIStore from "../ui";
import useUserStore from "../user";

describe("resetAllStores", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useUserStore.getState().reset = jest.fn();
		useGlobalStore.getState().reset = jest.fn();
		useUIStore.getState().reset = jest.fn();
		useImagesCarouselStore.getState().reset = jest.fn();
		useAuthStore.getState().reset = jest.fn();
		useProfileStore.getState().reset = jest.fn();
		usePhotosStore.getState().reset = jest.fn();
		useFriendsStore.getState().reset = jest.fn();
	});

	test("calls reset on each store", () => {
		resetAllStores();

		expect(useUserStore.getState().reset).not.toHaveBeenCalled();
		expect(useGlobalStore.getState().reset).not.toHaveBeenCalled();
		expect(useUIStore.getState().reset).not.toHaveBeenCalled();
		expect(useImagesCarouselStore.getState().reset).not.toHaveBeenCalled();
		expect(useAuthStore.getState().reset).not.toHaveBeenCalled();
		expect(useProfileStore.getState().reset).not.toHaveBeenCalled();
		expect(usePhotosStore.getState().reset).not.toHaveBeenCalled();
		expect(useFriendsStore.getState().reset).not.toHaveBeenCalled();
	});
});
