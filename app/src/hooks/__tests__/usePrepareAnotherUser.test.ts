import { act, renderHook } from "@testing-library/react";

import useProfileStore from "@store/profile";
import usePrepareAnotherUser from "../usePrepareAnotherUser";

jest.mock("@core/Request");
jest.mock("@hooks/useMainClient");
jest.mock("@hooks/useUserIdOutsideRoute");
jest.mock("@store/profile");

describe("usePrepareAnotherUser", () => {
	const mockMainClient = {
		existProfile: jest.fn(),
		mainApi: {
			getAnotherUser: jest.fn().mockResolvedValue({}),
		},
	};

	it("should return initial loading state and profile existence", () => {
		const { result } = renderHook(() => usePrepareAnotherUser());

		expect(result.current).toEqual({
			isLoading: true,
			isExistProfile: undefined,
		});
	});

	it("should not fetch user data when userId is not provided", async () => {
		const mockSetPrepareAnotherUser = jest.fn();
		(useProfileStore.getState as jest.Mock).mockReturnValue({
			isPrepareAnotherUser: false,
			setPrepareAnotherUser: mockSetPrepareAnotherUser,
		});

		renderHook(() => usePrepareAnotherUser());

		await act(async () => {
			await Promise.resolve();
		});

		expect(mockSetPrepareAnotherUser).not.toHaveBeenCalled();
		expect(mockMainClient.mainApi.getAnotherUser).not.toHaveBeenCalled();
	});

	it("should not fetch user data when already loading", async () => {
		mockMainClient.existProfile.mockReturnValue(false);
		const mockSetPrepareAnotherUser = jest.fn();
		(useProfileStore.getState as jest.Mock).mockReturnValue({
			isPrepareAnotherUser: true,
			setPrepareAnotherUser: mockSetPrepareAnotherUser,
		});

		renderHook(() => usePrepareAnotherUser());

		await act(async () => {
			await Promise.resolve();
		});

		expect(mockSetPrepareAnotherUser).not.toHaveBeenCalled();
		expect(mockMainClient.mainApi.getAnotherUser).not.toHaveBeenCalled();
	});
});
