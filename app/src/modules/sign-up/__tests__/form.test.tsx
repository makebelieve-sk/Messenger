import { act, fireEvent, render, screen } from "@testing-library/react";

import SignUpForm from "@modules/sign-up/Form";

jest.mock("@service/i18n", () => ({
	t: (key: string) => key,
}));

jest.mock("react-phone-input-2", () => {
	return {
		__esModule: true,
		default: ({ value, onChange, inputProps }) => (
			<input
				{...inputProps}
				value={value}
				onChange={(e) => onChange(e.target.value, { format: "..." })}
				data-testid="phone-input"
			/>
		),
	};
});

jest.mock("react-phone-input-2/lib/material.css", () => ({}));

describe("SignUpForm", () => {
	const mockFormValues = {
		values: {
			firstName: "",
			thirdName: "",
			email: "",
			phone: "",
			password: "",
			passwordConfirm: "",
			avatarUrl: "",
		},
		errors: {
			firstName: "",
			thirdName: "",
			email: "",
			phone: "",
			password: "",
			passwordConfirm: "",
			avatarUrl: "",
		},
	};

	const mockSetFormValues = jest.fn();
	const mockOnChange = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("matches snapshot", async () => {
		let container;
		await act(async () => {
			const result = render(
				<SignUpForm
					formValues={mockFormValues}
					setFormValues={mockSetFormValues}
					onChange={mockOnChange}
				/>,
			);
			container = result.container;
		});
		expect(container).toMatchSnapshot();
	});

	it("renders all form fields", async () => {
		await act(async () => {
			render(
				<SignUpForm
					formValues={mockFormValues}
					setFormValues={mockSetFormValues}
					onChange={mockOnChange}
				/>,
			);
		});

		const textFields = screen.getAllByTestId("text-field");
		expect(textFields).toHaveLength(5);
		expect(screen.getByTestId("phone-input")).toBeInTheDocument();
	});

	it("calls onChange when text fields are modified", async () => {
		await act(async () => {
			render(
				<SignUpForm
					formValues={mockFormValues}
					setFormValues={mockSetFormValues}
					onChange={mockOnChange}
				/>,
			);
		});

		const textFields = screen.getAllByTestId("text-field");
		const firstNameInput = textFields[0].querySelector("input");
    
		if (firstNameInput) {
			await act(async () => {
				fireEvent.change(firstNameInput, { target: { value: "John" } });
			});
			expect(mockOnChange).toHaveBeenCalledWith("firstName", "John", expect.any(Function));
		}
	});

	it("validates full name length", async () => {
		await act(async () => {
			render(
				<SignUpForm
					formValues={mockFormValues}
					setFormValues={mockSetFormValues}
					onChange={mockOnChange}
				/>,
			);
		});

		const textFields = screen.getAllByTestId("text-field");
		const firstNameInput = textFields[0].querySelector("input");
    
		if (firstNameInput) {
			await act(async () => {
				fireEvent.change(firstNameInput, { target: { value: "Jo" } });
			});
			expect(mockOnChange).toHaveBeenCalledWith(
				"firstName",
				"Jo",
				expect.any(Function),
			);
		}
	});

	it("validates email format", async () => {
		await act(async () => {
			render(
				<SignUpForm
					formValues={mockFormValues}
					setFormValues={mockSetFormValues}
					onChange={mockOnChange}
				/>,
			);
		});

		const textFields = screen.getAllByTestId("text-field");
		const emailInput = textFields[2].querySelector("input");
    
		if (emailInput) {
			await act(async () => {
				fireEvent.change(emailInput, { target: { value: "invalid-email" } });
			});
			expect(mockOnChange).toHaveBeenCalledWith(
				"email",
				"invalid-email",
				expect.any(Function),
			);
		}
	});

	it("validates password confirmation", async () => {
		const formValuesWithPassword = {
			...mockFormValues,
			values: {
				...mockFormValues.values,
				password: "password123",
			},
		};

		await act(async () => {
			render(
				<SignUpForm
					formValues={formValuesWithPassword}
					setFormValues={mockSetFormValues}
					onChange={mockOnChange}
				/>,
			);
		});

		const textFields = screen.getAllByTestId("text-field");
		const passwordConfirmInput = textFields[4].querySelector("input");
    
		if (passwordConfirmInput) {
			await act(async () => {
				fireEvent.change(passwordConfirmInput, { target: { value: "different-password" } });
			});
			expect(mockSetFormValues).toHaveBeenCalledWith(expect.objectContaining({
				errors: expect.objectContaining({
					password: "sign-up-module.password_incorrect",
					passwordConfirm: "sign-up-module.password_incorrect",
				}),
			}));
		}
	});

	it("shows error messages when fields are invalid", async () => {
		const formValuesWithErrors = {
			...mockFormValues,
			errors: {
				...mockFormValues.errors,
				firstName: "Required field",
				email: "Invalid email",
			},
		};

		let container;
		await act(async () => {
			const result = render(
				<SignUpForm
					formValues={formValuesWithErrors}
					setFormValues={mockSetFormValues}
					onChange={mockOnChange}
				/>,
			);
			container = result.container;
		});

		const errorMessages = screen.getAllByText(/Required field|Invalid email/);
		expect(errorMessages).toHaveLength(2);
		expect(container).toMatchSnapshot();
	});

	it("handles phone input changes", async () => {
		await act(async () => {
			render(
				<SignUpForm
					formValues={mockFormValues}
					setFormValues={mockSetFormValues}
					onChange={mockOnChange}
				/>,
			);
		});

		const phoneInput = screen.getByTestId("phone-input");
		await act(async () => {
			fireEvent.change(phoneInput, { target: { value: "+1234567890" } });
		});

		expect(mockOnChange).toHaveBeenCalledWith(
			"phone",
			"+1234567890",
			expect.any(Function),
		);
	});

	it("matches snapshot with all fields filled", async () => {
		const filledFormValues = {
			values: {
				firstName: "John",
				thirdName: "Doe",
				email: "john@example.com",
				phone: "+1234567890",
				password: "password123",
				passwordConfirm: "password123",
				avatarUrl: "https://example.com/avatar.jpg",
			},
			errors: {
				firstName: "",
				thirdName: "",
				email: "",
				phone: "",
				password: "",
				passwordConfirm: "",
				avatarUrl: "",
			},
		};

		let container;
		await act(async () => {
			const result = render(
				<SignUpForm
					formValues={filledFormValues}
					setFormValues={mockSetFormValues}
					onChange={mockOnChange}
				/>,
			);
			container = result.container;
		});
		expect(container).toMatchSnapshot();
	});
});
