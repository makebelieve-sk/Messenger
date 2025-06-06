import dayjs from "dayjs";
import { type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import LazyDatePicker from "@components/ui/date-picker";

interface IDatePicker { 
	label: string; 
	value?: { format: Function; }; 
	onChange: Function; 
	slotProps: { textField: { inputProps: { placeholder: string; }; }; }; 
};

jest.mock("@mui/x-date-pickers", () => ({
	__esModule: true,
	DatePicker: ({ label, value, onChange, slotProps }: IDatePicker) => (
		<div data-testid="date-picker">
			<label>{label}</label>
			<input 
				type="date" 
				value={value?.format("YYYY-MM-DD") || ""} 
				onChange={(e) => onChange?.(e.target.value ? dayjs(e.target.value) : null)}
				placeholder={slotProps.textField.inputProps.placeholder}
			/>
		</div>
	),
	LocalizationProvider: ({ children }: { children: ReactNode; }) => <div>{children}</div>,
}));

jest.mock("@mui/x-date-pickers/AdapterDayjs", () => ({
	__esModule: true,
	AdapterDayjs: {
		AdapterDayjs: {},
	},
}));

describe("LazyDatePicker", () => {
	const mockProps = {
		label: "Test Label",
		value: dayjs("2024-01-01"),
		placeholder: "Test Placeholder",
		onChange: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render with label", async () => {
		render(<LazyDatePicker {...mockProps} />);
        
		await screen.findByTestId("date-picker");
		const label = screen.getByText(mockProps.label);
		expect(label).toBeInTheDocument();
	});

	it("should render with placeholder", () => {
		render(<LazyDatePicker {...mockProps} />);
        
		const input = screen.getByPlaceholderText(mockProps.placeholder);
		expect(input).toBeInTheDocument();
	});

	it("should render with initial value", () => {
		render(<LazyDatePicker {...mockProps} />);
        
		const input = screen.getByDisplayValue("2024-01-01");
		expect(input).toBeInTheDocument();
	});

	it("should call onChange when date is changed", () => {
		render(<LazyDatePicker {...mockProps} />);
        
		const input = screen.getByDisplayValue("2024-01-01");
		fireEvent.change(input, { target: { value: "2024-02-01" } });
        
		expect(mockProps.onChange).toHaveBeenCalledWith(dayjs("2024-02-01"));
	});

	it("should disable future dates", async () => {
		render(<LazyDatePicker {...mockProps} />);
        
		await screen.findByTestId("date-picker");
		const input = screen.getByPlaceholderText(mockProps.placeholder);
        
		fireEvent.change(input, { target: { value: "2025-01-01" } });
        
		expect(input).toHaveValue("2024-01-01");
	});

	it("should handle empty value", async () => {
		const mockOnChange = jest.fn();
		render(
			<LazyDatePicker 
				{...mockProps} 
				onChange={mockOnChange}
			/>,
		);
        
		await screen.findByTestId("date-picker");
		const input = screen.getByPlaceholderText(mockProps.placeholder);
        
		fireEvent.change(input, { target: { value: "" } });
		expect(mockOnChange).toHaveBeenCalledWith(null);
	});

	it("should handle no-op onChange", () => {
		const noOpOnChange = () => {};
		render(<LazyDatePicker {...mockProps} onChange={noOpOnChange} />);
        
		const input = screen.getByDisplayValue("2024-01-01");
		fireEvent.change(input, { target: { value: "2024-02-01" } });
        
		// Should not throw error
		expect(input).toBeInTheDocument();
	});

	it("matches snapshot", () => {
		const { asFragment } = render(<LazyDatePicker {...mockProps} />);
		expect(asFragment()).toMatchSnapshot();
	});
});
