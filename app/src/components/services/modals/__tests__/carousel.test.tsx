import { fireEvent, render, screen } from "@testing-library/react";

import ModalWithImagesCarousel from "@components/services/modals/carousel";
import { mockPhotosService } from "../../../../__mocks__/@hooks/useProfile";
import mockImagesCarouselStore from "../../../../__mocks__/@store/images-carousel";
import usePhotosStore from "../../../../__mocks__/@store/photos";

describe("ModalWithImagesCarousel", () => {
	const mockPhoto = {
		id: "1",
		userId: "123",
		path: "/photo1.jpg",
		createdAt: "2024-01-01",
		size: "1024",
		extension: "jpg",
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockPhotosService.photos = [ mockPhoto ];
		mockPhotosService.count = 1;
		const photosStore = usePhotosStore.getState();
		photosStore.photos = [ mockPhoto ];
		photosStore.count = 1;
	});

	it("should not render when isAvatar is false and photoIndex is null", () => {
		const store = mockImagesCarouselStore.getState();
		store.isAvatar = false;
		store.photoIndex = null;

		const { container } = render(<ModalWithImagesCarousel />);
		expect(container).toBeEmptyDOMElement();
	});

	it("should not render when isAvatar is false and photoIndex is negative", () => {
		const store = mockImagesCarouselStore.getState();
		store.isAvatar = false;
		store.photoIndex = -1;

		const { container } = render(<ModalWithImagesCarousel />);
		expect(container).toBeEmptyDOMElement();
	});

	it("should render avatar carousel when isAvatar is true", () => {
		const store = mockImagesCarouselStore.getState();
		store.isAvatar = true;
		store.photoIndex = null;

		const { container } = render(<ModalWithImagesCarousel />);
        
		expect(screen.getByTestId("modal-root")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should render photos carousel when photoIndex is valid", async () => {
		const store = mockImagesCarouselStore.getState();
		store.isAvatar = false;
		store.photoIndex = 0;

		const { container } = render(<ModalWithImagesCarousel />);
        
		await screen.findByTestId("carousel");
		expect(container).toMatchSnapshot();
	});

	it("should render both carousels when isAvatar is true and photoIndex is valid", async () => {
		const store = mockImagesCarouselStore.getState();
		store.isAvatar = true;
		store.photoIndex = 0;

		const { container } = render(<ModalWithImagesCarousel />);
        
		const carousels = await screen.findAllByTestId("carousel");
		expect(carousels).toHaveLength(2);
		expect(container).toMatchSnapshot();
	});

	it("should reset store when modal is closed", async () => {
		const store = mockImagesCarouselStore.getState();
		store.isAvatar = true;
		store.photoIndex = 0;

		render(<ModalWithImagesCarousel />);
        
		await screen.findAllByTestId("carousel");
		const closeButton = screen.getByTestId("close-icon");
		fireEvent.click(closeButton);

		expect(store.reset).toHaveBeenCalled();
	});
});
