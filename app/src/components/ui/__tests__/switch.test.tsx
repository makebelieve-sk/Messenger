import { fireEvent, render, screen } from "@testing-library/react";

import SwitchComponent from "@components/ui/switch";

describe("SwitchComponent", () => {
	const mockOnChange = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render with initial checked state", () => {
		render(
			<SwitchComponent 
				name="test-switch"
				checked={true}
				onChange={mockOnChange}
			/>,
		);
        
		const switchElement = screen.getByRole("checkbox");
		expect(switchElement).toBeChecked();
	});

	it("should render with initial unchecked state", () => {
		render(
			<SwitchComponent 
				name="test-switch"
				checked={false}
				onChange={mockOnChange}
			/>,
		);
        
		const switchElement = screen.getByRole("checkbox");
		expect(switchElement).not.toBeChecked();
	});

	it("should call onChange when toggled", () => {
		render(
			<SwitchComponent 
				name="test-switch"
				checked={false}
				onChange={mockOnChange}
			/>,
		);
        
		const switchElement = screen.getByRole("checkbox");
		fireEvent.click(switchElement);
        
		expect(mockOnChange).toHaveBeenCalled();
	});

	it("should have correct name attribute", () => {
		render(
			<SwitchComponent 
				name="test-switch"
				checked={false}
				onChange={mockOnChange}
			/>,
		);
        
		const switchElement = screen.getByRole("checkbox");
		expect(switchElement).toHaveAttribute("name", "test-switch");
	});

	it("matches snapshot", () => {
		const { asFragment } = render(
			<SwitchComponent 
				name="test-switch"
				checked={true}
				onChange={mockOnChange}
			/>,
		);
		expect(asFragment()).toMatchSnapshot();
	});
}); 