import { act, render, screen } from "@testing-library/react";

import EditTabsModule from "@modules/edit";
import { type IFormErrors, type IFormValues } from "@pages/Edit";
import { EditTabs } from "@custom-types/enums";

describe("EditTabsModule", () => {
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

	const mockFormErrors: IFormErrors = {
		name: "Name is required",
		email: "Invalid email format",
	};

	const mockOnChange = jest.fn();

	beforeEach(() => {
		mockOnChange.mockClear();
	});

	test("renders Main tab when tab is EditTabs.MAIN", async () => {
		await act(async () => {
			render(
				<EditTabsModule
					tab={EditTabs.MAIN}
					formValues={mockFormValues}
					formErrors={null}
					onChange={mockOnChange}
				/>,
			);
		});

		expect(screen.getByRole("tabpanel")).toHaveAttribute("id", "vertical-tabpanel-0");
		expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "vertical-tab-0");
	});

	test("renders Contacts tab when tab is EditTabs.CONTACTS", async () => {
		await act(async () => {
			render(
				<EditTabsModule
					tab={EditTabs.CONTACTS}
					formValues={mockFormValues}
					formErrors={null}
					onChange={mockOnChange}
				/>,
			);
		});

		expect(screen.getByRole("tabpanel")).toHaveAttribute("id", "vertical-tabpanel-1");
		expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "vertical-tab-1");
	});

	test("passes correct props to Main tab component", async () => {
		await act(async () => {
			render(
				<EditTabsModule
					tab={EditTabs.MAIN}
					formValues={mockFormValues}
					formErrors={mockFormErrors}
					onChange={mockOnChange}
				/>,
			);
		});

		const inputs = screen.getAllByRole("textbox");
		const nameInput = inputs.find(input => input.getAttribute("name") === "name");
		expect(nameInput).toBeInTheDocument();
		expect(nameInput).toHaveValue(mockFormValues.name);
	});

	test("passes correct props to Contacts tab component", async () => {
		await act(async () => {
			render(
				<EditTabsModule
					tab={EditTabs.CONTACTS}
					formValues={mockFormValues}
					formErrors={mockFormErrors}
					onChange={mockOnChange}
				/>,
			);
		});

		const inputs = screen.getAllByRole("textbox");
		const emailInput = inputs.find(input => input.getAttribute("name") === "email");
		expect(emailInput).toBeInTheDocument();
		expect(emailInput).toHaveValue(mockFormValues.email);
	});

	test("matches snapshot for Main tab", async () => {
		let asFragment;
		await act(async () => {
			const { asFragment: fragment } = render(
				<EditTabsModule
					tab={EditTabs.MAIN}
					formValues={mockFormValues}
					formErrors={mockFormErrors}
					onChange={mockOnChange}
				/>,
			);
			asFragment = fragment;
		});

		expect(asFragment()).toMatchSnapshot();
	});

	test("matches snapshot for Contacts tab", async () => {
		let asFragment;
		await act(async () => {
			const { asFragment: fragment } = render(
				<EditTabsModule
					tab={EditTabs.CONTACTS}
					formValues={mockFormValues}
					formErrors={mockFormErrors}
					onChange={mockOnChange}
				/>,
			);
			asFragment = fragment;
		});

		expect(asFragment()).toMatchSnapshot();
	});
});
