import { render, screen, waitFor } from "@testing-library/react";

import PhotosCarousel from "@components/services/carousels/photos-carousel";
import { type IPhoto } from "@custom-types/models.types";
import { mockPhotosService } from "../../../../__mocks__/@hooks/useProfile";
import mockImagesCarouselStore from "../../../../__mocks__/@store/images-carousel";

describe("PhotosCarousel", () => {
	const mockPhoto: IPhoto = {
		id: "1",
		userId: "123",
		path: "/photo1.jpg",
		createdAt: "2024-01-01",
		size: "1024",
		extension: "jpg",
	};

	beforeEach(() => {
		jest.clearAllMocks();
		const store = mockImagesCarouselStore.getState();
		store.photoIndex = null;
		mockPhotosService.photos = [];
		mockPhotosService.count = 0;
	});

	it("should match snapshot when no photo is selected", () => {
		const { container } = render(<PhotosCarousel />);
		expect(container).toMatchSnapshot();
	});

	it("should match snapshot when photo is selected", async () => {
		mockPhotosService.photos = [ mockPhoto ];
		mockPhotosService.count = 1;

		const store = mockImagesCarouselStore.getState();
		store.photoIndex = 0;

		const { container } = render(<PhotosCarousel />);
		await screen.findByTestId("carousel");
		expect(container).toMatchSnapshot();
	});

	it("should not render when no photo is selected", () => {
		const { container } = render(<PhotosCarousel />);
		expect(container.firstChild).toBeNull();
	});

	it("should render carousel when photo is selected and exists in photos service", async () => {
		mockPhotosService.photos = [ mockPhoto ];
		mockPhotosService.count = 1;

		const store = mockImagesCarouselStore.getState();
		store.photoIndex = 0;

		render(<PhotosCarousel />);

		const carousel = await screen.findByTestId("carousel");
		expect(carousel).toBeTruthy();

		const image = screen.getByRole("img");
		expect(image.getAttribute("src")).toBe("/photo1.jpg");
		expect(image.getAttribute("alt")).toBe("1");
	});

	it("should load more photos when reaching threshold", async () => {
		mockPhotosService.photos = [
			mockPhoto,
			{
				...mockPhoto,
				id: "2",
				path: "/photo2.jpg",
				createdAt: "2024-01-02",
			},
		];
		mockPhotosService.count = 2;

		const store = mockImagesCarouselStore.getState();
		store.photoIndex = 0;

		render(<PhotosCarousel />);

		await screen.findByTestId("carousel");

		store.photoIndex = 1;

		await waitFor(() => {
			expect(mockPhotosService.getAllPhotos).toHaveBeenCalled();
		});
	});

	it("should not render when selected photo is not found", async () => {
		mockPhotosService.photos = [ mockPhoto ];
		mockPhotosService.count = 1;

		const store = mockImagesCarouselStore.getState();
		store.photoIndex = 999;

		const { container } = render(<PhotosCarousel />);
		expect(container.firstChild).toBeNull();
	});

	it("should not render when photos array is empty", async () => {
		mockPhotosService.photos = [];
		mockPhotosService.count = 0;

		const store = mockImagesCarouselStore.getState();
		store.photoIndex = 0;

		const { container } = render(<PhotosCarousel />);
		expect(container.firstChild).toBeNull();
	});
});
