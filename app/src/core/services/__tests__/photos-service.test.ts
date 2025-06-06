import { ApiRoutes } from "common-types";

import type Request from "@core/Request";
import PhotosService from "@core/services/PhotosService";
import { type IPhoto } from "@custom-types/models.types";
import { PHOTOS_LIMIT } from "@utils/constants";
import useImagesCarouselStore from "../../../__mocks__/@store/images-carousel";
import usePhotosStore from "../../../__mocks__/@store/photos";
import useUIStore from "../../../__mocks__/@store/ui";

interface IMockRequestParams {
  route: ApiRoutes;
  data?: unknown;
  setLoading?: (isLoading: boolean) => void;
  successCb?: (result: unknown) => void;
  config?: { headers?: { [key: string]: string } };
}

const mockRequest = {
	post: jest.fn((params: IMockRequestParams) => {
		if (params.setLoading) params.setLoading(true);
		if (params.successCb) params.successCb({ success: true });
	}),
	get: jest.fn(),
	put: jest.fn(),
	downloadFile: jest.fn(),
	_instance: {},
	_catchErrors: {},
	_errorHandler: jest.fn(),
	_handleSuccessStatuses: jest.fn(),
} as unknown as jest.Mocked<Request>;

const mockUserId = "test-user-id";

const createMockPhoto = (id: string, path: string): IPhoto => ({
	id,
	path,
	userId: mockUserId,
	size: "1000",
	extension: "jpg",
	createdAt: new Date().toISOString(),
});

describe("PhotosService", () => {
	let photosService: PhotosService;

	beforeEach(() => {
		photosService = new PhotosService(mockRequest, mockUserId);
		jest.clearAllMocks();
	});

	describe("getters", () => {
		it("should return photos array", () => {
			const mockPhotos = [ createMockPhoto("1", "path1") ];
			photosService["_photos"] = mockPhotos;
			expect(photosService.photos).toEqual(mockPhotos);
		});

		it("should return count", () => {
			const count = 5;
			photosService["_count"] = count;
			expect(photosService.count).toBe(count);
		});
	});

	describe("getAllPhotos", () => {
		it("should not make request if hasMore is false", () => {
			const photosStore = usePhotosStore.getState();
			const syncPhotosSpy = jest.spyOn(photosStore, "syncPhotos");
      
			photosService["_hasMore"] = false;
			photosService.getAllPhotos();

			expect(mockRequest.post).not.toHaveBeenCalled();
			expect(syncPhotosSpy).toHaveBeenCalled();
		});

		it("should fetch photos and update store", () => {
			const mockPhotos = [
				createMockPhoto("1", "path1"),
				createMockPhoto("2", "path2"),
			];
			const mockCount = 2;
			const photosStore = usePhotosStore.getState();
			const setPhotosLoadingSpy = jest.spyOn(photosStore, "setPhotosLoading");
			const syncPhotosSpy = jest.spyOn(photosStore, "syncPhotos");

			mockRequest.post.mockImplementation((params: IMockRequestParams) => {
				if (params.setLoading) params.setLoading(true);
				if (params.successCb) params.successCb({ success: true, photos: mockPhotos, count: mockCount });
			});

			photosService.getAllPhotos();

			expect(mockRequest.post).toHaveBeenCalledWith({
				route: ApiRoutes.getPhotos,
				data: { userId: mockUserId, lastCreatedDate: null, limit: PHOTOS_LIMIT },
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
			});

			expect(setPhotosLoadingSpy).toHaveBeenCalledWith(true);
			expect(syncPhotosSpy).toHaveBeenCalledWith({
				photos: mockPhotos,
				count: mockCount,
				hasMore: false,
			});
		});
	});

	describe("onClickPhoto", () => {
		it("should set carousel index when photo exists", () => {
			const mockPhotos = [ createMockPhoto("1", "path1") ];
			photosService["_photos"] = mockPhotos;
      
			const carouselStore = useImagesCarouselStore.getState();
			const setIndexSpy = jest.spyOn(carouselStore, "setIndex");

			photosService.onClickPhoto("1");

			expect(setIndexSpy).toHaveBeenCalledWith(0);
		});

		it("should not set carousel index when photo does not exist", () => {
			const mockPhotos = [ createMockPhoto("1", "path1") ];
			photosService["_photos"] = mockPhotos;
      
			const carouselStore = useImagesCarouselStore.getState();
			const setIndexSpy = jest.spyOn(carouselStore, "setIndex");

			photosService.onClickPhoto("2");

			expect(setIndexSpy).not.toHaveBeenCalled();
		});
	});

	describe("addPhotoFromAvatar", () => {
		it("should add photo and update store", () => {
			const mockPhoto = createMockPhoto("1", "path1");
			const photosStore = usePhotosStore.getState();
			const syncPhotosSpy = jest.spyOn(photosStore, "syncPhotos");

			photosService.addPhotoFromAvatar(mockPhoto);

			expect(photosService["_photos"]).toEqual([ mockPhoto ]);
			expect(photosService["_count"]).toBe(1);
			expect(syncPhotosSpy).toHaveBeenCalled();
		});
	});

	describe("addPhotos", () => {
		it("should add photos and update store", () => {
			const mockFormData = new FormData();
			const mockPhotos = [ createMockPhoto("1", "path1") ];
			const photosStore = usePhotosStore.getState();
			const setAddPhotosLoadingSpy = jest.spyOn(photosStore, "setAddPhotosLoading");
			const syncPhotosSpy = jest.spyOn(photosStore, "syncPhotos");

			mockRequest.post.mockImplementation((params: IMockRequestParams) => {
				if (params.setLoading) params.setLoading(true);
				if (params.successCb) params.successCb({ success: true, photos: mockPhotos });
			});

			photosService.addPhotos(mockFormData);

			expect(mockRequest.post).toHaveBeenCalledWith({
				route: ApiRoutes.savePhotos,
				data: mockFormData,
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
				config: { headers: { "Content-Type": "multipart/form-data" } },
			});

			expect(setAddPhotosLoadingSpy).toHaveBeenCalledWith(true);
			expect(syncPhotosSpy).toHaveBeenCalledWith({
				photos: mockPhotos,
				count: mockPhotos.length,
				hasMore: true,
			});
		});
	});

	describe("deletePhoto", () => {
		it("should not call getAllPhotos when photos length is greater than limit", async () => {
			const mockPhotos = Array(20).fill(createMockPhoto("1", "path1"));
			photosService["_photos"] = mockPhotos;
			photosService["_hasMore"] = true;
			photosService["_count"] = 30;

			const getAllPhotosSpy = jest.spyOn(photosService, "getAllPhotos");
      
			mockRequest.post.mockImplementation((params: IMockRequestParams) => {
				if (params.successCb) params.successCb({ success: true });
			});

			photosService.deletePhoto({ photoId: "1", imageUrl: "path1", isAvatar: false }, true);
      
			expect(getAllPhotosSpy).not.toHaveBeenCalled();
		});

		it("should not call getAllPhotos when hasMore is false", async () => {
			const mockPhotos = Array(4).fill(createMockPhoto("1", "path1"));
			photosService["_photos"] = mockPhotos;
			photosService["_hasMore"] = false;
			photosService["_count"] = 4;

			const getAllPhotosSpy = jest.spyOn(photosService, "getAllPhotos");
      
			mockRequest.post.mockImplementation((params: IMockRequestParams) => {
				if (params.successCb) params.successCb({ success: true });
			});

			photosService.deletePhoto({ photoId: "1", imageUrl: "path1", isAvatar: false }, true);
      
			expect(getAllPhotosSpy).not.toHaveBeenCalled();
		});

		it("should not call getAllPhotos when fromProfile is false", async () => {
			const mockPhotos = Array(4).fill(createMockPhoto("1", "path1"));
			photosService["_photos"] = mockPhotos;
			photosService["_hasMore"] = true;
			photosService["_count"] = 10;

			const getAllPhotosSpy = jest.spyOn(photosService, "getAllPhotos");
      
			mockRequest.post.mockImplementation((params: IMockRequestParams) => {
				if (params.successCb) params.successCb({ success: true });
			});

			photosService.deletePhoto({ photoId: "1", imageUrl: "path1", isAvatar: false }, false);
      
			expect(getAllPhotosSpy).not.toHaveBeenCalled();
		});

		it("should delete photo and update store", () => {
			const mockPhoto = createMockPhoto("1", "path1");
			photosService["_photos"] = [ mockPhoto ];
			photosService["_count"] = 1;

			const photosStore = usePhotosStore.getState();
			const syncPhotosSpy = jest.spyOn(photosStore, "syncPhotos");

			mockRequest.post.mockImplementation((params: IMockRequestParams) => {
				if (params.successCb) params.successCb({ success: true });
			});

			photosService.deletePhoto({ photoId: "1", imageUrl: "path1", isAvatar: false });

			expect(mockRequest.post).toHaveBeenCalledWith({
				route: ApiRoutes.deletePhoto,
				data: { photoId: "1", imageUrl: "path1", isAvatar: false },
				successCb: expect.any(Function),
			});

			expect(photosService["_photos"]).toEqual([]);
			expect(photosService["_count"]).toBe(0);
			expect(syncPhotosSpy).toHaveBeenCalled();
		});

		it("should show error when photo not found", () => {
			const uiStore = useUIStore.getState();
			const setErrorSpy = jest.spyOn(uiStore, "setError");

			mockRequest.post.mockImplementation((params: IMockRequestParams) => {
				if (params.successCb) params.successCb({ success: true });
			});

			photosService.deletePhoto({ photoId: "1", imageUrl: "path1", isAvatar: false });

			expect(setErrorSpy).toHaveBeenCalledWith(
				"Произошла ошибка при удалении фотографии. Фотография не найдена.",
			);
		});
	});
});
