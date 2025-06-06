import { fireEvent, render, screen } from "@testing-library/react";

import CarouselButton from "@modules/carousel/button";
import mockImagesCarouselStore from "../../../__mocks__/@store/images-carousel";

jest.mock("@service/i18n", () => ({
	t: (key: string) => {
		const translations: Record<string, string> = {
			"images-carousel-module.further": "Next",
			"images-carousel-module.back": "Back",
		};
		return translations[key] || key;
	},
}));

describe("CarouselButton", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders next button correctly", () => {
		render(<CarouselButton isNext isDisabled={false} />);
    
		expect(screen.getByText("Next")).toBeInTheDocument();
		expect(screen.getByTestId("arrow-right-icon")).toBeInTheDocument();
		expect(screen.getByText("Next").closest("button")).not.toBeDisabled();
	});

	it("renders previous button correctly", () => {
		render(<CarouselButton isNext={false} isDisabled={false} />);
    
		expect(screen.getByText("Back")).toBeInTheDocument();
		expect(screen.getByTestId("arrow-left-icon")).toBeInTheDocument();
		expect(screen.getByText("Back").closest("button")).not.toBeDisabled();
	});

	it("disables button when isDisabled is true", () => {
		render(<CarouselButton isNext isDisabled={true} />);
    
		expect(screen.getByText("Next").closest("button")).toBeDisabled();
	});

	it("calls changeIndex with correct value when clicked", () => {
		const mockChangeIndex = jest.fn();
		mockImagesCarouselStore.getState().changeIndex = mockChangeIndex;

		const { unmount } = render(<CarouselButton isNext isDisabled={false} />);
		fireEvent.click(screen.getByText("Next").closest("button")!);
		expect(mockChangeIndex).toHaveBeenCalledWith(1);
		unmount();

		render(<CarouselButton isNext={false} isDisabled={false} />);
		fireEvent.click(screen.getByText("Back").closest("button")!);
		expect(mockChangeIndex).toHaveBeenCalledWith(-1);
	});
});
