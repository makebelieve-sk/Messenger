import useImagesCarouselStore from "../images-carousel";

describe("useImagesCarouselStore", () => {
	beforeEach(() => {
		useImagesCarouselStore.getState().reset();
	});

	test("default state", () => {
		const state = useImagesCarouselStore.getState();
		expect(state.isAvatar).toBe(false);
		expect(state.photoIndex).toBeNull();
	});

	test("setAvatar updates isAvatar", () => {
		useImagesCarouselStore.getState().setAvatar(true);
		expect(useImagesCarouselStore.getState().isAvatar).toBe(true);
	});

	test("setIndex updates photoIndex", () => {
		useImagesCarouselStore.getState().setIndex(3);
		expect(useImagesCarouselStore.getState().photoIndex).toBe(3);
	});

	test("changeIndex increments and decrements photoIndex", () => {
		useImagesCarouselStore.getState().setIndex(3);
		useImagesCarouselStore.getState().changeIndex(1);
		expect(useImagesCarouselStore.getState().photoIndex).toBe(4);
        
		useImagesCarouselStore.getState().changeIndex(-1);
		expect(useImagesCarouselStore.getState().photoIndex).toBe(3);
	});

	test("reset restores default state", () => {
		useImagesCarouselStore.getState().setAvatar(true);
		useImagesCarouselStore.getState().setIndex(3);
        
		useImagesCarouselStore.getState().reset();
        
		const state = useImagesCarouselStore.getState();
		expect(state.isAvatar).toBe(false);
		expect(state.photoIndex).toBeNull();
	});
});