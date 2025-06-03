import { fireEvent, render, screen } from "@testing-library/react";

import Contacts from "@modules/edit/contacts/contacts";
import { type IFormValues } from "@pages/Edit";

describe("Contacts", () => {
	const mockFormValues: IFormValues = {
		name: "John",
		surName: "Doe",
		phone: "+7 (999) 123-45-67",
		email: "test@example.com",
		sex: "male",
		birthday: "1990-01-01",
		work: "Developer",
		city: "Moscow",
	};

	const mockFormErrors = {
		phone: "Invalid phone number",
		email: "Invalid email format",
	};

	const mockOnChange = jest.fn();

	beforeEach(() => {
		mockOnChange.mockClear();
	});

	test("renders all form fields correctly", () => {
		render(
			<Contacts
				formValues={mockFormValues}
				formErrors={null}
				onChange={mockOnChange}
			/>,
		);

		expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
	});

	test("displays form values correctly", () => {
		render(
			<Contacts
				formValues={mockFormValues}
				formErrors={null}
				onChange={mockOnChange}
			/>,
		);

		expect(screen.getByLabelText(/city/i)).toHaveValue(mockFormValues.city);
		expect(screen.getByLabelText(/phone/i)).toHaveValue(mockFormValues.phone);
		expect(screen.getByLabelText(/email/i)).toHaveValue(mockFormValues.email);
	});

	test("displays error messages when formErrors is provided", () => {
		render(
			<Contacts
				formValues={mockFormValues}
				formErrors={mockFormErrors}
				onChange={mockOnChange}
			/>,
		);

		expect(screen.getByText(mockFormErrors.phone)).toBeInTheDocument();
		expect(screen.getByText(mockFormErrors.email)).toBeInTheDocument();
	});

	test("calls onChange when input values change", () => {
		render(
			<Contacts
				formValues={mockFormValues}
				formErrors={null}
				onChange={mockOnChange}
			/>,
		);

		const cityInput = screen.getByLabelText(/city/i);
		fireEvent.change(cityInput, { target: { value: "New York" } });

		expect(mockOnChange).toHaveBeenCalledWith("city", "New York");
	});

	test("calls onChange with phone value when phone input changes", () => {
		render(
			<Contacts
				formValues={mockFormValues}
				formErrors={null}
				onChange={mockOnChange}
			/>,
		);

		const phoneInput = screen.getByLabelText(/phone/i);
		const newPhoneValue = "+7 (999) 987-65-43";
		fireEvent.change(phoneInput, { target: { value: newPhoneValue } });

		expect(mockOnChange).toHaveBeenCalledWith("phone", newPhoneValue);
	});

	test("matches snapshot with no errors", () => {
		const { asFragment } = render(
			<Contacts
				formValues={mockFormValues}
				formErrors={null}
				onChange={mockOnChange}
			/>,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	test("matches snapshot with errors", () => {
		const { asFragment } = render(
			<Contacts
				formValues={mockFormValues}
				formErrors={mockFormErrors}
				onChange={mockOnChange}
			/>,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
