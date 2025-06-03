import { render, screen } from "@testing-library/react";

import ServiceComponents from "@components/main/ServiceComponents";
import mockImagesCarouselStore from "../../../__mocks__/@store/images-carousel";
import mockUIStore from "../../../__mocks__/@store/ui";

describe("ServiceComponents", () => {
	it("shows error modal when error is set in store", () => {
		const store = mockUIStore.getState();
		store.error = "test error";
    
		const { container } = render(<ServiceComponents isAuth={false} />);
    
		expect(screen.getByTestId("modal-root")).toBeInTheDocument();
		expect(screen.getByText("test error")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("shows confirm modal when confirmModal is set in store", () => {
		const store = mockUIStore.getState();
		store.error = "";
		store.confirmModal = { text: "test confirm", onConfirm: () => {} };
    
		const { container } = render(<ServiceComponents isAuth={false} />);
    
		expect(screen.getByTestId("modal-root")).toBeInTheDocument();
		expect(screen.getByText("test confirm")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("shows snackbar error when snackbarError is set in store", () => {
		const store = mockUIStore.getState();
		store.confirmModal = null;
		store.snackbarError = "test snackbar error";
    
		const { container } = render(<ServiceComponents isAuth={false} />);
    
		expect(screen.getByTestId("snackbar-component")).toBeInTheDocument();
		expect(screen.getByText("test snackbar error")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("shows images carousel when isAvatar is true and photoIndex is set", () => {
		const store = mockImagesCarouselStore.getState();
		store.isAvatar = true;
		store.photoIndex = 0;
    
		const { container } = render(<ServiceComponents isAuth={true} />);
    
		expect(screen.getByTestId("modal-root")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("shows settings modal when settingsModal is true and user is authenticated", () => {
		const storeImages = mockImagesCarouselStore.getState();
		storeImages.isAvatar = false;
		storeImages.photoIndex = null;

		const store = mockUIStore.getState();
		store.settingsModal = true;
    
		const { container } = render(<ServiceComponents isAuth={true} />);
    
		expect(screen.getByTestId("modal-root")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});
});
