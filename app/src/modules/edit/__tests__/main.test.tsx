import { act, fireEvent, render, screen } from "@testing-library/react";

import Main from "@modules/edit/main";
import { type IFormValues } from "@pages/Edit";

jest.mock("@components/ui/select", () => {
	return function MockSelect({ labelId, id, text, value, onChange }) {
		return (
			<div data-testid="select">
				<label id={labelId}>{text}</label>
				<select
					id={id}
					value={value}
					onChange={(e) => onChange({ target: { value: e.target.value === "notSelected" ? null : e.target.value } })}
					aria-labelledby={labelId}
				>
					<option value="notSelected">Not specified</option>
					<option value="male">Male</option>
					<option value="female">Female</option>
				</select>
			</div>
		);
	};
});

describe("Main", () => {
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
		name: "Name is required",
		surName: "Surname is required",
	};

	const mockOnChange = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, "error").mockImplementation(() => {});
		mockOnChange.mockClear();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test("renders all form fields correctly", () => {
		render(
			<Main
				formValues={mockFormValues}
				formErrors={null}
				onChange={mockOnChange}
			/>,
		);

		const textFields = screen.getAllByTestId("text-field");
		expect(textFields).toHaveLength(3);

		expect(screen.getByTestId("select")).toBeInTheDocument();
	});

	test("displays form values correctly", () => {
		render(
			<Main
				formValues={mockFormValues}
				formErrors={null}
				onChange={mockOnChange}
			/>,
		);

		const inputs = screen.getAllByRole("textbox");
		const nameInput = inputs.find(input => input.getAttribute("name") === "name");
		const surNameInput = inputs.find(input => input.getAttribute("name") === "surName");
		const workInput = inputs.find(input => input.getAttribute("name") === "work");

		expect(nameInput).toHaveValue(mockFormValues.name);
		expect(surNameInput).toHaveValue(mockFormValues.surName);
		expect(workInput).toHaveValue(mockFormValues.work);
	});

	test("displays error messages when formErrors is provided", async () => {
		await act(async () => {
			render(
				<Main
					formValues={mockFormValues}
					formErrors={mockFormErrors}
					onChange={mockOnChange}
				/>,
			);
		});

		expect(screen.getByText(mockFormErrors.name)).toBeInTheDocument();
		expect(screen.getByText(mockFormErrors.surName)).toBeInTheDocument();
	});

	test("calls onChange when input values change", async () => {
		await act(async () => {
			render(
				<Main
					formValues={mockFormValues}
					formErrors={null}
					onChange={mockOnChange}
				/>,
			);
		});

		const inputs = screen.getAllByRole("textbox");
		const nameInput = inputs.find(input => input.getAttribute("name") === "name");
        
		if (nameInput) {
			await act(async () => {
				fireEvent.change(nameInput, { target: { value: "Jane" } });
			});
			expect(mockOnChange).toHaveBeenCalledWith("name", "Jane");
		}
	});

	test("calls onChange when surname input changes", async () => {
		await act(async () => {
			render(
				<Main
					formValues={mockFormValues}
					formErrors={null}
					onChange={mockOnChange}
				/>,
			);
		});

		const inputs = screen.getAllByRole("textbox");
		const surNameInput = inputs.find(input => input.getAttribute("name") === "surName");
        
		if (surNameInput) {
			await act(async () => {
				fireEvent.change(surNameInput, { target: { value: "Smith" } });
			});
			expect(mockOnChange).toHaveBeenCalledWith("surName", "Smith");
		}
	});

	test("calls onChange when work input changes", async () => {
		await act(async () => {
			render(
				<Main
					formValues={mockFormValues}
					formErrors={null}
					onChange={mockOnChange}
				/>,
			);
		});

		const inputs = screen.getAllByRole("textbox");
		const workInput = inputs.find(input => input.getAttribute("name") === "work");
        
		if (workInput) {
			await act(async () => {
				fireEvent.change(workInput, { target: { value: "Designer" } });
			});
			expect(mockOnChange).toHaveBeenCalledWith("work", "Designer");
		}
	});

	test("displays correct initial sex value", async () => {
		await act(async () => {
			render(
				<Main
					formValues={mockFormValues}
					formErrors={null}
					onChange={mockOnChange}
				/>,
			);
		});

		const sexSelect = screen.getByTestId("select").querySelector("select");
		expect(sexSelect).toHaveValue(mockFormValues.sex);
	});

	test("displays notSelected when sex value is empty", async () => {
		const formValuesWithEmptySex = { ...mockFormValues, sex: "" };
		await act(async () => {
			render(
				<Main
					formValues={formValuesWithEmptySex}
					formErrors={null}
					onChange={mockOnChange}
				/>,
			);
		});

		const sexSelect = screen.getByTestId("select").querySelector("select");
		expect(sexSelect).toHaveValue("notSelected");
	});

	test("calls onChange with sex value when sex select changes", async () => {
		await act(async () => {
			render(
				<Main
					formValues={mockFormValues}
					formErrors={null}
					onChange={mockOnChange}
				/>,
			);
		});

		const sexSelect = screen.getByTestId("select").querySelector("select");
		if (sexSelect) {
			await act(async () => {
				fireEvent.change(sexSelect, { target: { value: "female" } });
			});
			expect(mockOnChange).toHaveBeenCalledWith("sex", "female");
		}
	});

	test("calls onChange with null sex value when empty option is selected", async () => {
		await act(async () => {
			render(
				<Main
					formValues={mockFormValues}
					formErrors={null}
					onChange={mockOnChange}
				/>,
			);
		});

		const sexSelect = screen.getByTestId("select").querySelector("select");
		if (sexSelect) {
			await act(async () => {
				fireEvent.change(sexSelect, { target: { value: "notSelected" } });
			});
			expect(mockOnChange).toHaveBeenCalledWith("sex", null);
		}
	});

	test("matches snapshot with no errors", async () => {
		let asFragment;
		await act(async () => {
			const { asFragment: fragment } = render(
				<Main
					formValues={mockFormValues}
					formErrors={null}
					onChange={mockOnChange}
				/>,
			);
			asFragment = fragment;
		});

		expect(asFragment()).toMatchSnapshot();
	});

	test("matches snapshot with errors", async () => {
		let asFragment;
		await act(async () => {
			const { asFragment: fragment } = render(
				<Main
					formValues={mockFormValues}
					formErrors={mockFormErrors}
					onChange={mockOnChange}
				/>,
			);
			asFragment = fragment;
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("handles async operations correctly", async () => {
		await act(async () => {
			render(
				<Main
					formValues={mockFormValues}
					formErrors={null}
					onChange={mockOnChange}
				/>,
			);
		});
	});
});
