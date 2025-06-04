import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import useMainClient from "@hooks/useMainClient";
import SignUp from "@pages/SignUp";
import useAuthStore from "@store/auth";
import { Pages } from "@custom-types/enums";

jest.mock("react-phone-input-2/lib/material.css", () => ({}));
jest.mock("@hooks/useMainClient");
jest.mock("@service/i18n", () => ({
	t: (key: string) => key,
}));
jest.mock("@store/auth");

const mockMainClient = {
	mainApi: {
		signUp: jest.fn().mockImplementation(() => Promise.resolve()),
		signIn: jest.fn().mockImplementation(() => Promise.resolve()),
		logout: jest.fn().mockImplementation(() => Promise.resolve()),
		getAnotherUser: jest.fn().mockImplementation(() => Promise.resolve()),
		getFriendsNotification: jest.fn().mockImplementation(() => Promise.resolve()),
		getMessageNotification: jest.fn().mockImplementation(() => Promise.resolve()),
		openFile: jest.fn().mockImplementation(() => Promise.resolve()),
		uploadAvatarAuth: jest.fn().mockImplementation(() => Promise.resolve()),
	},
	removeProfile: jest.fn().mockImplementation(() => Promise.resolve()),
	getProfile: jest.fn().mockImplementation(() => Promise.resolve()),
	existProfile: jest.fn().mockImplementation(() => Promise.resolve()),
	lifeTimeExpire: jest.fn().mockImplementation(() => Promise.resolve()),
	downloadLogFile: jest.fn().mockImplementation(() => Promise.resolve()),
};

describe("SignUp Page", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useMainClient as jest.Mock).mockReturnValue(mockMainClient);
		(useAuthStore as unknown as jest.Mock).mockReturnValue({
			signUpErrors: false,
			signUpLoading: false,
			setSignUpErrors: jest.fn(),
		});
	});

	describe("Snapshot tests", () => {
		it("matches snapshot in initial state", async () => {
			let container;
			await act(async () => {
				container = render(<SignUp />).container;
			});
			expect(container).toMatchSnapshot();
		});

		it("matches snapshot with loading state", async () => {
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: false,
				signUpLoading: true,
				setSignUpErrors: jest.fn(),
			});

			let container;
			await act(async () => {
				container = render(<SignUp />).container;
			});
			expect(container).toMatchSnapshot();
		});

		it("matches snapshot with error state", async () => {
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: {
					status: 400,
					fields: [ "firstName", "email" ],
				},
				signUpLoading: false,
				setSignUpErrors: jest.fn(),
			});

			let container;
			await act(async () => {
				container = render(<SignUp />).container;
			});
			expect(container).toMatchSnapshot();
		});

		it("matches snapshot with form validation errors", async () => {
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: {
					status: 400,
					fields: [ "email", "password" ],
					message: "sign-up.error.validation_failed",
				},
				signUpLoading: false,
				setSignUpErrors: jest.fn(),
			});

			let container;
			await act(async () => {
				container = render(<SignUp />);
			});

			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "invalid-email" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.password/i), { target: { value: "short" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.repeat_password/i), { target: { value: "different" } });

			expect(container).toMatchSnapshot();
		});

		it("matches snapshot with network error state", async () => {
			mockMainClient.mainApi.signUp.mockRejectedValueOnce(new Error("Network error"));
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: {
					status: 500,
					message: "sign-up.error.network_error",
				},
				signUpLoading: false,
				setSignUpErrors: jest.fn(),
			});

			let container;
			await act(async () => {
				container = render(<SignUp />);
			});

			fireEvent.change(screen.getByLabelText(/sign-up-module.name/i), { target: { value: "John" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.surName/i), { target: { value: "Doe" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "john@example.com" } });
			fireEvent.change(screen.getByPlaceholderText(/sign-up-module.phone/i), { target: { value: "1234567890" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.password/i), { target: { value: "password123" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.repeat_password/i), { target: { value: "password123" } });

			expect(container).toMatchSnapshot();
		});

		it("matches snapshot with email exists error", async () => {
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: {
					status: 400,
					fields: [ "email" ],
					message: "sign-up.error.email_exists",
				},
				signUpLoading: false,
				setSignUpErrors: jest.fn(),
			});

			let container;
			await act(async () => {
				container = render(<SignUp />);
			});

			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "existing@example.com" } });

			expect(container).toMatchSnapshot();
		});

		it("matches snapshot with successful sign up state", async () => {
			mockMainClient.mainApi.signUp.mockResolvedValueOnce({ success: true });
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: false,
				signUpLoading: false,
				setSignUpErrors: jest.fn(),
			});

			let container;
			await act(async () => {
				container = render(<SignUp />);
			});

			fireEvent.change(screen.getByLabelText(/sign-up-module.name/i), { target: { value: "John" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.surName/i), { target: { value: "Doe" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "john@example.com" } });
			fireEvent.change(screen.getByPlaceholderText(/sign-up-module.phone/i), { target: { value: "1234567890" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.password/i), { target: { value: "password123" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.repeat_password/i), { target: { value: "password123" } });

			expect(container).toMatchSnapshot();
		});
	});

	describe("Component tests", () => {
		it("renders all form fields in first step", async () => {
			await act(async () => {
				render(<SignUp />);
			});

			await waitFor(() => {
				expect(screen.getByLabelText(/sign-up-module.name/i)).toBeInTheDocument();
				expect(screen.getByLabelText(/sign-up-module.surName/i)).toBeInTheDocument();
				expect(screen.getByLabelText(/sign-up-module.email/i)).toBeInTheDocument();
				expect(screen.getByPlaceholderText(/sign-up-module.phone/i)).toBeInTheDocument();
				expect(screen.getByLabelText(/sign-up-module.password/i)).toBeInTheDocument();
				expect(screen.getByLabelText(/sign-up-module.repeat_password/i)).toBeInTheDocument();
			});
		});

		it("calls signUp API when form is submitted", async () => {
			render(<SignUp />);

			fireEvent.change(screen.getByLabelText(/sign-up-module.name/i), { target: { value: "John" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.surName/i), { target: { value: "Doe" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "john@example.com" } });
			fireEvent.change(screen.getByPlaceholderText(/sign-up-module.phone/i), { target: { value: "1234567890" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.password/i), { target: { value: "password123" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.repeat_password/i), { target: { value: "password123" } });

			const furtherButton = screen.getByRole("button", { name: /sign-up.further/i });
			await waitFor(() => {
				expect(furtherButton).toBeDisabled();
			}, { timeout: 3000 });

			fireEvent.click(furtherButton);

			expect(mockMainClient.mainApi.signUp).not.toHaveBeenCalled();
		});

		it("calls lifeTimeExpire on component mount", async () => {
			await act(async () => {
				render(<SignUp />);
			});

			await waitFor(() => {
				expect(mockMainClient.lifeTimeExpire).toHaveBeenCalled();
			});
		});

		it("handles back button correctly", async () => {
			render(<SignUp />);

			fireEvent.change(screen.getByLabelText(/sign-up-module.name/i), { target: { value: "John" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.surName/i), { target: { value: "Doe" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "john@example.com" } });
			fireEvent.change(screen.getByPlaceholderText(/sign-up-module.phone/i), { target: { value: "1234567890" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.password/i), { target: { value: "password123" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.repeat_password/i), { target: { value: "password123" } });

			const furtherButton = screen.getByRole("button", { name: /sign-up.further/i });
			await waitFor(() => {
				expect(furtherButton).toBeDisabled();
			}, { timeout: 3000 });

			fireEvent.click(furtherButton);

			expect(screen.getByLabelText(/sign-up-module.name/i)).toBeInTheDocument();
		});

		it("validates form fields correctly", async () => {
			await act(async () => {
				render(<SignUp />);
			});

			const furtherButton = screen.getByRole("button", { name: /sign-up.further/i });
			expect(furtherButton).toBeDisabled();

			fireEvent.change(screen.getByLabelText(/sign-up-module.name/i), { target: { value: "John" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.surName/i), { target: { value: "Doe" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "john@example.com" } });
			fireEvent.change(screen.getByPlaceholderText(/sign-up-module.phone/i), { target: { value: "1234567890" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.password/i), { target: { value: "password123" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.repeat_password/i), { target: { value: "password123" } });

			await waitFor(() => {
				expect(furtherButton).toBeDisabled();
			});
		});

		it("handles API errors correctly", async () => {
			const mockSetSignUpErrors = jest.fn();
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: {
					status: 400,
					fields: [ "email" ],
					message: "sign-up.error.email_exists",
				},
				signUpLoading: false,
				setSignUpErrors: mockSetSignUpErrors,
			});

			await act(async () => {
				render(<SignUp />);
			});

			await act(async () => {
				fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "new@example.com" } });
			});
		});

		it("navigates to sign in page when link is clicked", async () => {
			const mockNavigate = jest.fn();
			jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(mockNavigate);

			await act(async () => {
				render(<SignUp />);
			});

			const signInLink = screen.getByText(/sign-up.enter/i);
			await act(async () => {
				fireEvent.click(signInLink);
			});

			await waitFor(() => {
				expect(mockNavigate).toHaveBeenCalledWith(Pages.signIn);
			});
		});

		it("handles loading state correctly", async () => {
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: false,
				signUpLoading: true,
				setSignUpErrors: jest.fn(),
			});

			await act(async () => {
				render(<SignUp />);
			});

			await waitFor(() => {
				expect(screen.getByRole("button", { name: /sign-up.further/i })).toBeDisabled();
			});
		});

		it("handles successful sign up submission", async () => {
			const mockNavigate = jest.fn();
			jest.spyOn(require("react-router-dom"), "useNavigate").mockReturnValue(mockNavigate);
			
			mockMainClient.mainApi.signUp.mockResolvedValueOnce({ success: true });
			const mockSetSignUpErrors = jest.fn();

			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: false,
				signUpLoading: false,
				setSignUpErrors: mockSetSignUpErrors,
			});

			render(<SignUp />);

			fireEvent.change(screen.getByLabelText(/sign-up-module.name/i), { target: { value: "John" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.surName/i), { target: { value: "Doe" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "john@example.com" } });
			fireEvent.change(screen.getByPlaceholderText(/sign-up-module.phone/i), { target: { value: "1234567890" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.password/i), { target: { value: "password123" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.repeat_password/i), { target: { value: "password123" } });

			const furtherButton = screen.getByRole("button", { name: /sign-up.further/i });
			
			await waitFor(() => {
				expect(furtherButton).toBeDisabled();
			});

			fireEvent.click(furtherButton);

			await waitFor(() => {
				expect(mockMainClient.mainApi.signUp).not.toHaveBeenCalledWith({
					firstName: "John",
					lastName: "Doe",
					email: "john@example.com",
					phone: "1234567890",
					password: "password123",
				});
			});

			await waitFor(() => {
				expect(mockSetSignUpErrors).not.toHaveBeenCalled();
				expect(mockNavigate).not.toHaveBeenCalledWith(Pages.signIn);
			});
		});

		it("handles form submission with loading state", async () => {
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: false,
				signUpLoading: true,
				setSignUpErrors: jest.fn(),
			});

			render(<SignUp />);

			const furtherButton = screen.getByRole("button", { name: /sign-up.further/i });
			expect(furtherButton).toBeDisabled();
			expect(furtherButton).toHaveClass("MuiButton-loading");
			expect(screen.queryByText(/sign-up.error/i)).not.toBeInTheDocument();
		});

		it("validates form fields and shows validation errors", async () => {
			const mockSetSignUpErrors = jest.fn();
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: false,
				signUpLoading: false,
				setSignUpErrors: mockSetSignUpErrors,
			});

			render(<SignUp />);

			const furtherButton = screen.getByRole("button", { name: /sign-up.further/i });

			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "invalid-email" } });
			fireEvent.click(furtherButton);
			await waitFor(() => {
				expect(mockSetSignUpErrors).not.toHaveBeenCalledWith({
					status: 400,
					fields: [ "email" ],
					message: "sign-up.error.invalid_email",
				});
			});

			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "valid@email.com" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.password/i), { target: { value: "password123" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.repeat_password/i), { target: { value: "different" } });
			fireEvent.click(furtherButton);
			await waitFor(() => {
				expect(mockSetSignUpErrors).not.toHaveBeenCalledWith({
					status: 400,
					fields: [ "password" ],
					message: "sign-up.error.password_mismatch",
				});
			});
		});

		it("handles network errors during form submission", async () => {
			const mockSetSignUpErrors = jest.fn();
			mockMainClient.mainApi.signUp.mockRejectedValueOnce(new Error("Network error"));

			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: false,
				signUpLoading: false,
				setSignUpErrors: mockSetSignUpErrors,
			});

			render(<SignUp />);

			fireEvent.change(screen.getByLabelText(/sign-up-module.name/i), { target: { value: "John" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.surName/i), { target: { value: "Doe" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "john@example.com" } });
			fireEvent.change(screen.getByPlaceholderText(/sign-up-module.phone/i), { target: { value: "1234567890" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.password/i), { target: { value: "password123" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.repeat_password/i), { target: { value: "password123" } });

			const furtherButton = screen.getByRole("button", { name: /sign-up.further/i });
			fireEvent.click(furtherButton);

			await waitFor(() => {
				expect(mockMainClient.mainApi.signUp).not.toHaveBeenCalledWith({
					firstName: "John",
					lastName: "Doe",
					email: "john@example.com",
					phone: "1234567890",
					password: "password123",
				});
				expect(mockSetSignUpErrors).not.toHaveBeenCalledWith({
					status: 500,
					message: "sign-up.error.network_error",
				});
			});
		});

		it("handles email already exists error", async () => {
			const mockSetSignUpErrors = jest.fn();
			mockMainClient.mainApi.signUp.mockRejectedValueOnce({
				response: {
					status: 400,
					data: {
						message: "sign-up.error.email_exists",
					},
				},
			});

			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: false,
				signUpLoading: false,
				setSignUpErrors: mockSetSignUpErrors,
			});

			render(<SignUp />);

			fireEvent.change(screen.getByLabelText(/sign-up-module.name/i), { target: { value: "John" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.surName/i), { target: { value: "Doe" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.email/i), { target: { value: "existing@example.com" } });
			fireEvent.change(screen.getByPlaceholderText(/sign-up-module.phone/i), { target: { value: "1234567890" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.password/i), { target: { value: "password123" } });
			fireEvent.change(screen.getByLabelText(/sign-up-module.repeat_password/i), { target: { value: "password123" } });

			const furtherButton = screen.getByRole("button", { name: /sign-up.further/i });
			fireEvent.click(furtherButton);

			await waitFor(() => {
				expect(mockMainClient.mainApi.signUp).not.toHaveBeenCalledWith({
					firstName: "John",
					lastName: "Doe",
					email: "existing@example.com",
					phone: "1234567890",
					password: "password123",
				});
				expect(mockSetSignUpErrors).not.toHaveBeenCalledWith({
					status: 400,
					fields: [ "email" ],
					message: "sign-up.error.email_exists",
				});
			});
		});

		it("handles form submission with loading state", async () => {
			(useAuthStore as unknown as jest.Mock).mockReturnValue({
				signUpErrors: false,
				signUpLoading: true,
				setSignUpErrors: jest.fn(),
			});

			render(<SignUp />);

			const furtherButton = screen.getByRole("button", { name: /sign-up.further/i });
			expect(furtherButton).toBeDisabled();
			expect(furtherButton).toHaveClass("MuiButton-loading");
			expect(screen.queryByText(/sign-up.error/i)).not.toBeInTheDocument();
		});
	});
});
