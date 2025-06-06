import { ApiRoutes } from "common-types";
import { fireEvent, render, screen } from "@testing-library/react";

import ChangeAvatarComponent from "@components/ui/change-avatar";
import { mockMainApi } from "../../../__mocks__/@hooks/useMainClient";

describe("ChangeAvatarComponent", () => {
	const mockProps = {
		labelText: "Change Avatar",
		loading: false,
		onChange: jest.fn(),
		setLoading: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render with label text", () => {
		render(<ChangeAvatarComponent {...mockProps} />);
        
		const label = screen.getByText(mockProps.labelText);
		expect(label).toBeInTheDocument();
	});

	it("should render input with correct id", () => {
		render(<ChangeAvatarComponent {...mockProps} />);
        
		const input = screen.getByTestId("input-image");
		expect(input).toHaveAttribute("id", `change-avatar-${mockProps.labelText}`);
	});

	it("should handle file upload with auth", () => {
		render(<ChangeAvatarComponent {...mockProps} />);
        
		const file = new File([ "test" ], "test.jpg", { type: "image/jpeg" });
		const input = screen.getByTestId("input-image");

		fireEvent.change(input, { target: { files: [ file ] } });
        
		const formData = new FormData();
		formData.append("avatar", file);
        
		expect(mockMainApi.uploadAvatarAuth).toHaveBeenCalledWith(
			ApiRoutes.uploadAvatar,
			formData,
			mockProps.setLoading,
			expect.any(Function),
		);
	});

	it("should not upload if no file is selected", () => {
		render(<ChangeAvatarComponent {...mockProps} />);
        
		const input = screen.getByTestId("input-image");
		fireEvent.change(input, { target: { files: [] } });

		expect(mockMainApi.uploadAvatarAuth).not.toHaveBeenCalled();
	});

	it("should show loading state", () => {
		render(<ChangeAvatarComponent {...mockProps} />);
        
		const button = screen.getByRole("button");
		const loadingWrapper = button.querySelector(".MuiButton-loadingWrapper");
		expect(loadingWrapper).toHaveStyle({ display: "contents" });
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<ChangeAvatarComponent {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
