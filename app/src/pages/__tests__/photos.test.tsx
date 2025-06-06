import { act, fireEvent, render } from "@testing-library/react";

import Photos from "@pages/Photos";
import type { IPhoto } from "@custom-types/models.types";
import { mockPhotosService } from "../../__mocks__/@hooks/useProfile";
import mockPhotosStore from "../../__mocks__/@store/photos";
import mockProfileStore from "../../__mocks__/@store/profile";
import mockUserStore from "../../__mocks__/@store/user";

import "../../__mocks__/react-i18next";

jest.mock("@hooks/usePrepareAnotherUser", () => ({
	__esModule: true,
	default: () => ({
		isLoadingAnotherUser: false,
		isExistProfile: true,
	}),
}));

describe("Photos Component", () => {
	const mockPhotos: IPhoto[] = [
		{
			id: "1",
			userId: "123",
			size: "1024",
			path: "/path/to/photo1.jpg",
			extension: "jpg",
			createdAt: "2024-01-01",
		},
		{
			id: "2",
			userId: "123",
			size: "1024",
			path: "/path/to/photo2.jpg",
			extension: "jpg",
			createdAt: "2024-01-02",
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();

		const photosStore = mockPhotosStore.getState();
		photosStore.photos = mockPhotos;
		photosStore.isPhotosLoading = false;
		photosStore.hasMore = true;
		photosStore.isAddPhotosLoading = false;
		photosStore.reset = jest.fn();
		photosStore.getAllPhotos = jest.fn().mockResolvedValue(mockPhotos);

		const userStore = mockUserStore.getState();
		userStore.user = {
			id: "123",
			firstName: "John",
			secondName: "",
			thirdName: "Doe",
			email: "john@example.com",
			phone: "+1234567890",
			avatarUrl: "",
			avatarCreateDate: "",
			fullName: "John Doe",
		};

		mockPhotosService.photos = mockPhotos;
		mockPhotosService.count = mockPhotos.length;
		mockPhotosService.getAllPhotos = jest.fn().mockResolvedValue(mockPhotos);
		mockPhotosService.onClickPhoto = jest.fn();
		mockPhotosService.deletePhoto = jest.fn();
		mockPhotosService.addPhotos = jest.fn();
		mockPhotosService.addPhotoFromAvatar = jest.fn();

		const profileStore = mockProfileStore.getState();
		profileStore.isPrepareAnotherUser = false;
		profileStore.isMe = true;
	});

	it("matches snapshot in initial state", async () => {
		const { container } = await act(async () => {
			return render(<Photos />);
		});
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with loading state", async () => {
		const photosStore = mockPhotosStore.getState();
		photosStore.isPhotosLoading = true;

		const { container } = await act(async () => {
			return render(<Photos />);
		});
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with empty state", async () => {
		const photosStore = mockPhotosStore.getState();
		photosStore.photos = [];
		photosStore.getAllPhotos = jest.fn().mockResolvedValue([]);

		const { container } = await act(async () => {
			return render(<Photos />);
		});
		expect(container).toMatchSnapshot();
	});

	it("renders photos grid correctly", async () => {
		const { container } = await act(async () => {
			return render(<Photos />);
		});

		const photosContainer = container.querySelector(".photos__container");
		expect(photosContainer).toBeInTheDocument();

		const photoElements = container.querySelectorAll(".photos__container__item");
		expect(photoElements).toHaveLength(mockPhotos.length);

		mockPhotos.forEach((photo, index) => {
			const imgElement = photoElements[index].querySelector("img");
			expect(imgElement).toHaveAttribute("src", expect.stringContaining(photo.path));
		});
	});

	it("shows loading state", async () => {
		const photosStore = mockPhotosStore.getState();
		photosStore.isPhotosLoading = true;

		const { container } = await act(async () => {
			return render(<Photos />);
		});

		const spinner = container.querySelector(".spinner");
		expect(spinner).toBeInTheDocument();
	});

	it("shows empty state when no photos", async () => {
		const photosStore = mockPhotosStore.getState();
		photosStore.photos = [];
		photosStore.getAllPhotos = jest.fn().mockResolvedValue([]);

		const { container } = await act(async () => {
			return render(<Photos />);
		});

		const emptyState = container.querySelector(".no-data");
		expect(emptyState).not.toBeInTheDocument();
	});

	it("handles photo click", async () => {
		const { container } = await act(async () => {
			return render(<Photos />);
		});

		const firstPhoto = container.querySelector(".photo__image");
		expect(firstPhoto).toBeInTheDocument();
		fireEvent.click(firstPhoto!);

		expect(mockPhotosService.onClickPhoto).toHaveBeenCalledWith(mockPhotos[0].id);
	});

	it("handles photo deletion", async () => {
		const { container } = await act(async () => {
			return render(<Photos />);
		});

		const photo = container.querySelector(".photo__image");
		expect(photo).toBeInTheDocument();
		fireEvent.click(photo!);

		expect(mockPhotosService.deletePhoto).not.toHaveBeenCalled();
	});
});
