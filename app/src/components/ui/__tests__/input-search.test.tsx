import { fireEvent, render, screen } from "@testing-library/react";

import InputSearch from "@components/ui/input-search";

describe("InputSearch", () => {
	const mockOnChange = jest.fn();
	const defaultProps = {
		placeholder: "Search...",
		value: "",
		onChange: mockOnChange,
	};

	beforeEach(() => {
		mockOnChange.mockClear();
	});

	it("should render InputSearch with default props", () => {
		render(<InputSearch {...defaultProps} />);
        
		expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
		expect(screen.getByTestId("SearchIcon")).toBeInTheDocument();
	});

	it("should render with border when haveBorder is true", () => {
		render(<InputSearch {...defaultProps} haveBorder={true} />);
        
		const container = screen.getByPlaceholderText("Search...").closest(".input-search");
		expect(container).toHaveClass("input-search__field-with-border");
	});

	it("should apply custom class names", () => {
		render(
			<InputSearch 
				{...defaultProps} 
				classNameInput="custom-input" 
				classNameIcon="custom-icon" 
			/>,
		);
        
		const inputContainer = screen.getByPlaceholderText("Search...").closest(".input-search__field");
		expect(inputContainer).toHaveClass("custom-input");
		expect(screen.getByTestId("SearchIcon")).toHaveClass("custom-icon");
	});

	it("should show clear button when value is not empty", () => {
		render(<InputSearch {...defaultProps} value="test" />);
        
		expect(screen.getByTestId("CloseIcon")).toBeInTheDocument();
	});

	it("should not show clear button when value is empty", () => {
		render(<InputSearch {...defaultProps} value="" />);
        
		expect(screen.queryByTestId("CloseIcon")).not.toBeInTheDocument();
	});

	it("should call onChange when input value changes", () => {
		render(<InputSearch {...defaultProps} />);
        
		const input = screen.getByPlaceholderText("Search...");
		fireEvent.change(input, { target: { value: "new value" } });
        
		expect(mockOnChange).toHaveBeenCalledWith("new value");
	});

	it("should clear input when clear button is clicked", () => {
		render(<InputSearch {...defaultProps} value="test" />);
        
		const clearButton = screen.getByTestId("CloseIcon");
		fireEvent.click(clearButton);
        
		expect(mockOnChange).toHaveBeenCalledWith("");
	});

	it("matches snapshot with default props", () => {
		const { asFragment } = render(<InputSearch {...defaultProps} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it("matches snapshot with border", () => {
		const { asFragment } = render(<InputSearch {...defaultProps} haveBorder={true} />);
		expect(asFragment()).toMatchSnapshot();
	});

	it("matches snapshot with value", () => {
		const { asFragment } = render(<InputSearch {...defaultProps} value="test" />);
		expect(asFragment()).toMatchSnapshot();
	});
});
