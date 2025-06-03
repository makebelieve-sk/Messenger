import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import useMainClient from "@hooks/useMainClient";
import SignIn from "@pages/SignIn";
import useAuthStore from "@store/auth";
import { Pages } from "@custom-types/enums";

jest.mock("@hooks/useMainClient");
jest.mock("@service/i18n", () => ({
	t: (key: string) => key,
}));
jest.mock("@store/auth");

describe("SignIn Page", () => {
	const mockMainClient = {
		mainApi: {
			signIn: jest.fn(),
		},
		lifeTimeExpire: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(useMainClient as jest.Mock).mockReturnValue(mockMainClient);
		(useAuthStore as unknown as jest.Mock).mockReturnValue({
			signInErrors: false,
			signInLoading: false,
			setSignInErrors: jest.fn(),
		});
	});

	describe("Snapshot tests", () => {
		it("matches snapshot in initial state", async () => {
			let container;
			await act(async () => {
				container = render(<SignIn />).container;
			});
			expect(container).toMatchSnapshot();
		});

		it("matches snapshot with loading state", async () => {
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signInErrors: false,
				signInLoading: true,
				setSignInErrors: jest.fn(),
			});

			let container;
			await act(async () => {
				container = render(<SignIn />).container;
			});
			expect(container).toMatchSnapshot();
		});

		it("matches snapshot with error state", async () => {
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signInErrors: true,
				signInLoading: false,
				setSignInErrors: jest.fn(),
			});

			let container;
			await act(async () => {
				container = render(<SignIn />).container;
			});
			expect(container).toMatchSnapshot();
		});
	});

	describe("Component tests", () => {
		it("renders all form fields", async () => {
			await act(async () => {
				render(<SignIn />);
			});

			await waitFor(() => {
				expect(screen.getByLabelText(/sign-in.login/i)).toBeInTheDocument();
				expect(screen.getByLabelText(/sign-in.password/i)).toBeInTheDocument();
				expect(screen.getByText(/sign-in.remember_me/i)).toBeInTheDocument();
			});
		});

		it("removes profile on component mount", async () => {
			await act(async () => {
				render(<SignIn />);
			});

			await waitFor(() => {
				expect(mockMainClient.lifeTimeExpire).toHaveBeenCalled();
			});
		});

		it("navigates to reset password page when forgot password link is clicked", async () => {
			const mockNavigate = jest.fn();
			jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(mockNavigate);

			await act(async () => {
				render(<SignIn />);
			});
      
			const forgotPasswordLink = screen.getByText(/sign-in.forgot_password/i);
			await act(async () => {
				fireEvent.click(forgotPasswordLink);
			});

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith(Pages.resetPassword);
			});
		});

		it("navigates to sign up page when register link is clicked", async () => {
			const mockNavigate = jest.fn();
			jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(mockNavigate);

			await act(async () => {
				render(<SignIn />);
			});
      
			const registerLink = screen.getByText(/sign-in.register/i);
			await act(async () => {
				fireEvent.click(registerLink);
			});

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith(Pages.signUp);
			});
		});
	});
});
