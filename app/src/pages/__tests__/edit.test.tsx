import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import Edit from "@pages/Edit";
import type { IUser, IUserDetails } from "@custom-types/models.types";
import mockProfileStore from "../../__mocks__/@store/profile";
import mockUserStore from "../../__mocks__/@store/user";

import "../../__mocks__/react-i18next";

describe("Edit Component", () => {
	const mockUserData = {
		firstName: "John",
		thirdName: "Doe",
		email: "john@example.com",
		phone: "+1234567890",
	} as IUser;

	const mockEditUserDetails = {
		birthday: "1990-01-01",
		city: "New York",
		work: "Developer",
		sex: "male",
	} as IUserDetails;

	beforeEach(() => {
		jest.clearAllMocks();

		const userStore = mockUserStore.getState();
		userStore.user = mockUserData;
		userStore.editUserDetails = mockEditUserDetails;

		const store = mockProfileStore.getState();

		store.showEditAlert = false;
		store.isEditLoading = false;
		store.editErrors = undefined;
		store.setShowEditAlert = jest.fn();
	});

	it("matches snapshot in initial state", async () => {
		const { container } = await act(async () => {
			return render(<Edit />);
		});
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with loading state", async () => {
		const store = mockProfileStore.getState();
		store.isEditLoading = true;

		const { container } = await act(async () => {
			return render(<Edit />);
		});
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with success alert", async () => {
		const store = mockProfileStore.getState();
		store.showEditAlert = true;

		const { container } = await act(async () => {
			return render(<Edit />);
		});
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with error state", async () => {
		const store = mockProfileStore.getState();
		store.editErrors = { field: "email" };

		const { container } = await act(async () => {
			return render(<Edit />);
		});
		expect(container).toMatchSnapshot();
	});

	it("renders the edit form with initial values", async () => {
		await act(async () => {
			render(<Edit />);
		});

		const tabs = screen.getAllByRole("tab");
		expect(tabs[0]).toHaveTextContent("Main");
		expect(tabs[1]).toHaveTextContent("Contacts");

		expect(screen.getByDisplayValue(mockUserData.firstName)).toBeInTheDocument();
		expect(screen.getByDisplayValue(mockUserData.thirdName)).toBeInTheDocument();

		await act(async () => {
			fireEvent.click(tabs[1]);
		});

		expect(screen.getByDisplayValue(mockUserData.email)).toBeInTheDocument();
		expect(screen.getByDisplayValue(mockUserData.phone)).toBeInTheDocument();
	});

	it("switches between tabs", async () => {
		await act(async () => {
			render(<Edit />);
		});

		const tabs = screen.getAllByRole("tab");
		expect(tabs[0]).toHaveAttribute("aria-selected", "true");

		await act(async () => {
			fireEvent.click(tabs[1]);
		});

		expect(tabs[1]).toHaveAttribute("aria-selected", "true");
	});

	it("validates required fields", async () => {
		await act(async () => {
			render(<Edit />);
		});

		const nameInput = screen.getByDisplayValue(mockUserData.firstName);
    
		await act(async () => {
			fireEvent.change(nameInput, { target: { value: "" } });
		});

		const saveButton = screen.getByText("Save");
    
		await act(async () => {
			fireEvent.click(saveButton);
		});

		await waitFor(() => {
			expect(screen.getByText("This field is required")).toBeInTheDocument();
		});
	});

	it("shows success alert after successful save", async () => {
		const store = mockProfileStore.getState();
    
		store.showEditAlert = true;
		store.isEditLoading = false;
		store.editErrors = undefined;
		store.setShowEditAlert = jest.fn();

		await act(async () => {
			render(<Edit />);
		});

		const saveButton = screen.getByText("Save");
    
		await act(async () => {
			fireEvent.click(saveButton);
		});

		await waitFor(() => {
			expect(screen.getByText("Changes saved")).toBeInTheDocument();
		});
	});

	it("disables save button when loading", async () => {
		const store = mockProfileStore.getState();
    
		store.showEditAlert = false;
		store.isEditLoading = true;
		store.editErrors = undefined;
		store.setShowEditAlert = jest.fn();

		await act(async () => {
			render(<Edit />);
		});

		const saveButton = screen.getByText("Save");
		expect(saveButton).toBeDisabled();
	});

	it("clears error message when field is corrected", async () => {
		const store = mockProfileStore.getState();
    
		store.showEditAlert = false;
		store.isEditLoading = false;
		store.editErrors = { field: "email" };
		store.setShowEditAlert = jest.fn();

		await act(async () => {
			render(<Edit />);
		});

		const tabs = screen.getAllByRole("tab");
		await act(async () => {
			fireEvent.click(tabs[1]);
		});

		const emailInput = screen.getByDisplayValue(mockUserData.email);
    
		await act(async () => {
			fireEvent.change(emailInput, { target: { value: "valid@email.com" } });
		});

		await waitFor(() => {
			expect(screen.queryByText("Invalid email format")).not.toBeInTheDocument();
		});
	});
});
