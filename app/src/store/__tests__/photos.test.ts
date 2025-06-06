import usePhotosStore from "../photos";

describe("usePhotosStore", () => {
	let store: ReturnType<typeof usePhotosStore.getState>;

	beforeEach(() => {
		store = usePhotosStore.getState();
	});

	test("setPhotosLoading updates isPhotosLoading", () => {
		store.setPhotosLoading(true);
		const state = usePhotosStore.getState();
		expect(state.isPhotosLoading).toBe(true);
	});

	test("setAddPhotosLoading updates isAddPhotosLoading", () => {
		store.setAddPhotosLoading(true);
		const state = usePhotosStore.getState();
		expect(state.isAddPhotosLoading).toBe(true);
	});

	test("syncPhotos updates photos, count, and hasMore", () => {
		const photos = [ {
			id: "1",
			userId: "user1",
			path: "photos/a.jpg",
			extension: "jpg",
			size: "1024",
			createdAt: "2024-01-01T00:00:00.000Z",
		} ];
		const count = 1;
		const hasMore = true;

		store.syncPhotos({ photos, count, hasMore });
		const state = usePhotosStore.getState();
		expect(state.photos).toEqual(photos);
	});

	test("reset restores default state", () => {
		store.setPhotosLoading(true);
		store.setAddPhotosLoading(true);
		store.syncPhotos({
			photos: [ {
				id: "1",
				userId: "user1",
				path: "photos/a.jpg",
				extension: "jpg",
				size: "1024",
				createdAt: "2024-01-01T00:00:00.000Z",
			} ],
			count: 1,
			hasMore: true,
		});

		store.reset();

		const state = usePhotosStore.getState();
		expect(state.photos).toEqual([]);
		expect(state.count).toBe(0);
	});
});
