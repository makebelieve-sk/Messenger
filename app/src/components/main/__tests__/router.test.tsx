import { render } from "@testing-library/react";

import Router from "@components/main/Router";
import { Pages } from "@custom-types/enums";
import { mockNavigate } from "../../../__mocks__/react-router-dom";

describe("Router Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		Object.defineProperty(window, "location", {
			value: { pathname: "/" },
			writable: true,
		});
	});

	describe("Authenticated Routes", () => {
		it("redirects to profile on not exists route", () => {
			const { container } = render(<Router isAuth={true} />);
			expect(mockNavigate).toHaveBeenCalledWith(Pages.signIn);
			expect(container).toMatchSnapshot();
		});
	});

	describe("Unauthenticated Routes", () => {
		it("redirects to sign in on not exists route", () => {
			const { container } = render(<Router isAuth={false} />);
			expect(mockNavigate).toHaveBeenCalledWith(Pages.signIn);
			expect(container).toMatchSnapshot();
		});
	});

	describe("Navigation Behavior", () => {
		it("navigates when redirectTo is set and path is different", () => {
			window.location.pathname = "/some-other-path";
      
			const { container } = render(<Router isAuth={true} />);
      
			expect(mockNavigate).toHaveBeenCalled();
			expect(container).toMatchSnapshot();
		});

		it("does not navigate when already on sign up page and redirecting to sign in", () => {
			window.location.pathname = Pages.signUp;
      
			const { container } = render(<Router isAuth={false} />);
      
			expect(mockNavigate).not.toHaveBeenCalled();
			expect(container).toMatchSnapshot();
		});

		it("navigates to sign in when on profile page and not authenticated", () => {
			window.location.pathname = Pages.profile;
      
			const { container } = render(<Router isAuth={false} />);
      
			expect(mockNavigate).toHaveBeenCalledWith(Pages.signIn);
			expect(container).toMatchSnapshot();
		});
	});
});