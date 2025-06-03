import { act, render, screen } from "@testing-library/react";

import useProfile from "@hooks/useProfile";
import Friends from "@modules/profile/top-friends/friends";
import { mockProfileService } from "../../../../__mocks__/@hooks/useProfile";

jest.mock("@hooks/useProfile");
jest.mock("react-router-dom", () => ({
	useNavigate: () => jest.fn(),
}));

describe("Friends", () => {
	beforeEach(() => {
		(useProfile as jest.Mock).mockReturnValue(mockProfileService);
	});

	it("renders with no friends", async () => {
		await act(async () => {
			const { container } = render(<Friends />);
			expect(container).toMatchSnapshot();
		});
		expect(screen.getByTestId("no-data")).toBeInTheDocument();
	});

	it("calls getFriends on mount", async () => {
		await act(async () => {
			render(<Friends />);
		});
		expect(mockProfileService.getFriends).toHaveBeenCalled();
	});

	it("renders loading state", async () => {
		const { container, rerender } = render(<Friends />);
		expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
        
		const loadingComponent = <Friends />;
		loadingComponent.type.defaultProps = { loading: true };
		await act(async () => {
			rerender(loadingComponent);
		});
		expect(container).toMatchSnapshot();
	});

	it("renders friends count", async () => {
		await act(async () => {
			const { container } = render(<Friends />);
			expect(container).toMatchSnapshot();
		});
		expect(screen.getByText("0")).toBeInTheDocument();
	});

	it("renders friends title", async () => {
		await act(async () => {
			const { container } = render(<Friends />);
			expect(container).toMatchSnapshot();
		});
		expect(screen.getByText("Friends")).toBeInTheDocument();
	});
});
