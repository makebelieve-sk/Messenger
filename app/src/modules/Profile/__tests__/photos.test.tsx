import { act, fireEvent, render, screen } from "@testing-library/react";

import Photos from "@modules/profile/photos";
import { type IPhoto } from "@custom-types/models.types";
import useProfile from "../../../__mocks__/@hooks/useProfile";
import useUser from "../../../__mocks__/@hooks/useUser";
import usePhotosStore from "../../../__mocks__/@store/photos";

jest.mock("@service/i18n", () => ({
	t: (key: string) => key,
}));

describe("Photos", () => {
	const mockPhotos = [
		{ id: "1", path: "photo1.jpg" },
		{ id: "2", path: "photo2.jpg" },
		{ id: "3", path: "photo3.jpg" },
	] as IPhoto[];

	const mockProfile = {
		isMe: true,
		userService: {
			fullName: "Test User",
		},
	};

	const mockPhotosService = {
		getAllPhotos: jest.fn(),
		onClickPhoto: jest.fn(),
		addPhotos: jest.fn(),
		deletePhoto: jest.fn(),
	};

	beforeEach(() => {
		usePhotosStore.getState().isPhotosLoading = false;
		usePhotosStore.getState().isAddPhotosLoading = false;
		usePhotosStore.getState().photos = mockPhotos;
		usePhotosStore.getState().count = mockPhotos.length;
		(useProfile as jest.Mock).mockReturnValue(mockProfile);
		(useUser as jest.Mock).mockReturnValue({
			photosService: mockPhotosService,
		});
	});

	it("renders correctly", () => {
		const { container } = render(<Photos />);
		expect(container).toMatchSnapshot();
	});

	it("shows loading spinner when photos are loading", () => {
		usePhotosStore.getState().isPhotosLoading = true;
		usePhotosStore.getState().isAddPhotosLoading = false;
		usePhotosStore.getState().photos = [] as IPhoto[];
		usePhotosStore.getState().count = 0;

		render(<Photos />);
		expect(screen.getByTestId("spinner")).toBeInTheDocument();
	});

	it("shows no photos message when there are no photos", () => {
		usePhotosStore.getState().isPhotosLoading = false;
		usePhotosStore.getState().isAddPhotosLoading = false;
		usePhotosStore.getState().photos = [] as IPhoto[];
		usePhotosStore.getState().count = 0;

		render(<Photos />);
		expect(screen.getByText("profile-module.no_photos")).toBeInTheDocument();
	});

	it("shows add photos button for own profile", () => {
		render(<Photos />);
		const addButton = screen.getByText("profile-module.add_more");
		expect(addButton).toBeInTheDocument();
	});

	it("does not show add photos button for other user's profile", () => {
		(useProfile as jest.Mock).mockReturnValue({
			...mockProfile,
			isMe: false,
		});

		render(<Photos />);
		const addButton = screen.queryByText("profile-module.add_more");
		expect(addButton).not.toBeInTheDocument();
	});

	it("calls onClickPhoto when a photo is clicked", () => {
		render(<Photos />);
		const photo = screen.getAllByTestId("image")[0];
		fireEvent.click(photo);
		expect(mockPhotosService.onClickPhoto).toHaveBeenCalledWith("1");
	});

	it("calls deletePhoto when a photo is right-clicked", () => {
		const mockDeletePhoto = jest.fn();
		mockPhotosService.deletePhoto = mockDeletePhoto;

		render(<Photos />);
		const photo = screen.getAllByTestId("image")[0];
		fireEvent.contextMenu(photo);
		expect(mockDeletePhoto).not.toHaveBeenCalledWith(
			{ photoId: "1", imageUrl: "photo1.jpg", isAvatar: false },
			true,
		);
	});

	it("loads photos on mount", async () => {
		await act(async () => {
			render(<Photos />);
		});
		expect(mockPhotosService.getAllPhotos).toHaveBeenCalled();
	});

	it("handles adding new photos", async () => {
		await act(async () => {
			render(<Photos />);
		});
    
		const file = new File([ "test" ], "test.jpg", { type: "image/jpeg" });
		const input = screen.getByTestId("input-image");
    
		await act(async () => {
			fireEvent.change(input, { target: { files: [ file ] } });
		});
    
		expect(mockPhotosService.addPhotos).toHaveBeenCalled();
	});

	it("navigates to photos page when clicking watch all", async () => {
		const mockNavigate = jest.fn();
		jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(mockNavigate);

		await act(async () => {
			render(<Photos />);
		});
    
		const watchAllLink = screen.getByTestId("link");
		fireEvent.click(watchAllLink);
    
		expect(mockNavigate).toHaveBeenCalledWith("/photos");
	});

	it("shows loading spinner when adding photos", () => {
		usePhotosStore.getState().isAddPhotosLoading = true;
		render(<Photos />);
		const button = screen.getByText("profile-module.add_more").closest("button");
		expect(button).toHaveClass("MuiButton-loading");
	});
});
