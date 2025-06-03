import { fireEvent, render, screen } from "@testing-library/react";

import SwitchFormGroup from "@components/services/forms/switch-form-group";

describe("SwitchFormGroup", () => {
	const mockForm = {
		soundEnabled: true,
		messageSound: false,
		friendRequestSound: true,
	};

	const mockOnChange = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("matches snapshot with default props", () => {
		const { container } = render(<SwitchFormGroup form={mockForm} onChange={mockOnChange} />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with all switches enabled", () => {
		const allEnabledForm = {
			soundEnabled: true,
			messageSound: true,
			friendRequestSound: true,
		};
		const { container } = render(<SwitchFormGroup form={allEnabledForm} onChange={mockOnChange} />);
		expect(container).toMatchSnapshot();
	});

	it("matches snapshot with all switches disabled", () => {
		const allDisabledForm = {
			soundEnabled: false,
			messageSound: false,
			friendRequestSound: false,
		};
		const { container } = render(<SwitchFormGroup form={allDisabledForm} onChange={mockOnChange} />);
		expect(container).toMatchSnapshot();
	});

	it("renders all switches with correct labels", () => {
		render(<SwitchFormGroup form={mockForm} onChange={mockOnChange} />);

		expect(screen.getByLabelText("All sound notifications")).toBeInTheDocument();
		expect(screen.getByLabelText("Sound notifications when receiving a message")).toBeInTheDocument();
		expect(screen.getByLabelText("Sound notifications when receiving a friend's request")).toBeInTheDocument();
	});

	it("renders switches with correct initial states", () => {
		render(<SwitchFormGroup form={mockForm} onChange={mockOnChange} />);

		const soundEnabledSwitch = screen.getByLabelText("All sound notifications");
		const messageSoundSwitch = screen.getByLabelText("Sound notifications when receiving a message");
		const friendRequestSoundSwitch = screen.getByLabelText("Sound notifications when receiving a friend's request");

		expect(soundEnabledSwitch).toBeChecked();
		expect(messageSoundSwitch).not.toBeChecked();
		expect(friendRequestSoundSwitch).toBeChecked();
	});

	it("calls onChange with correct parameters when soundEnabled is toggled", () => {
		render(<SwitchFormGroup form={mockForm} onChange={mockOnChange} />);

		const soundEnabledSwitch = screen.getByLabelText("All sound notifications");
		fireEvent.click(soundEnabledSwitch);

		expect(mockOnChange).toHaveBeenCalledWith("soundEnabled", false);
	});

	it("calls onChange with correct parameters when messageSound is toggled", () => {
		render(<SwitchFormGroup form={mockForm} onChange={mockOnChange} />);

		const messageSoundSwitch = screen.getByLabelText("Sound notifications when receiving a message");
		fireEvent.click(messageSoundSwitch);

		expect(mockOnChange).toHaveBeenCalledWith("messageSound", true);
	});

	it("calls onChange with correct parameters when friendRequestSound is toggled", () => {
		render(<SwitchFormGroup form={mockForm} onChange={mockOnChange} />);

		const friendRequestSoundSwitch = screen.getByLabelText("Sound notifications when receiving a friend's request");
		fireEvent.click(friendRequestSoundSwitch);

		expect(mockOnChange).toHaveBeenCalledWith("friendRequestSound", false);
	});

	it("updates switch states when form prop changes", () => {
		const { rerender } = render(<SwitchFormGroup form={mockForm} onChange={mockOnChange} />);

		const newForm = {
			soundEnabled: false,
			messageSound: true,
			friendRequestSound: false,
		};

		rerender(<SwitchFormGroup form={newForm} onChange={mockOnChange} />);

		const soundEnabledSwitch = screen.getByLabelText("All sound notifications");
		const messageSoundSwitch = screen.getByLabelText("Sound notifications when receiving a message");
		const friendRequestSoundSwitch = screen.getByLabelText("Sound notifications when receiving a friend's request");

		expect(soundEnabledSwitch).not.toBeChecked();
		expect(messageSoundSwitch).toBeChecked();
		expect(friendRequestSoundSwitch).not.toBeChecked();
	});
});
