import dayjs from "dayjs";
import { fireEvent, render, screen } from "@testing-library/react";

import DatePickerComponent from "@modules/edit/date-picker";
import { type IFormValues } from "@pages/Edit";

jest.mock("@components/ui/date-picker", () => {
	return function MockLazyDatePicker({ label, value, placeholder, onChange }) {
		return (
			<div data-testid="lazy-date-picker">
				<label htmlFor="birthday-input">{label}</label>
				<input
					id="birthday-input"
					type="date"
					value={value?.format("YYYY-MM-DD") || ""}
					onChange={(e) => onChange?.(e.target.value ? dayjs(e.target.value) : null)}
					placeholder={placeholder}
				/>
			</div>
		);
	};
});

describe("DatePickerComponent", () => {
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

	const mockOnChangeField = jest.fn();

	beforeEach(() => {
		mockOnChangeField.mockClear();
	});

	test("renders date picker with correct label", () => {
		render(
			<DatePickerComponent
				formValues={mockFormValues}
				onChangeField={mockOnChangeField}
			/>,
		);

		expect(screen.getByLabelText(/birthday/i)).toBeInTheDocument();
	});

	test("displays correct initial value", () => {
		render(
			<DatePickerComponent
				formValues={mockFormValues}
				onChangeField={mockOnChangeField}
			/>,
		);

		const datePicker = screen.getByLabelText(/birthday/i);
		expect(datePicker).toHaveValue(mockFormValues.birthday);
	});

	test("calls onChangeField when date is changed", () => {
		render(
			<DatePickerComponent
				formValues={mockFormValues}
				onChangeField={mockOnChangeField}
			/>,
		);

		const datePicker = screen.getByLabelText(/birthday/i);
		const newDate = "2024-03-15";
		fireEvent.change(datePicker, { target: { value: newDate } });

		expect(mockOnChangeField).toHaveBeenCalledWith("birthday", newDate);
	});

	test("calls onChangeField with null when date is cleared", () => {
		render(
			<DatePickerComponent
				formValues={mockFormValues}
				onChangeField={mockOnChangeField}
			/>,
		);

		const datePicker = screen.getByLabelText(/birthday/i);
		fireEvent.change(datePicker, { target: { value: "" } });

		expect(mockOnChangeField).toHaveBeenCalledWith("birthday", null);
	});

	test("matches snapshot", () => {
		const { asFragment } = render(
			<DatePickerComponent
				formValues={mockFormValues}
				onChangeField={mockOnChangeField}
			/>,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
