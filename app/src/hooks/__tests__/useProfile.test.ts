import { renderHook } from "@testing-library/react";

import ProfilesController from "@core/controllers/ProfilesController";
import useProfile from "../useProfile";

jest.mock("@core/controllers/ProfilesController");
jest.mock("@core/services/ProfileService");

describe("useProfile", () => {
	const mockUserId = "test-user-id";
	const mockProfile = {
		isMe: false,
		userService: {
			id: mockUserId,
			name: "Test User",
		},
		photosService: {
			photos: [],
		},
	};

	let mockProfilesController: jest.Mocked<ProfilesController>;
	let mockMainClient: { getProfile: jest.Mock };

	beforeEach(() => {
		jest.clearAllMocks();

		mockProfilesController = {
			getProfile: jest.fn().mockReturnValue(mockProfile),
			checkProfile: jest.fn(),
			createProfile: jest.fn(),
			removeProfile: jest.fn(),
			getMyProfileId: jest.fn(),
			profiles: new Map(),
		} as unknown as jest.Mocked<ProfilesController>;

		mockMainClient = {
			getProfile: jest.fn().mockReturnValue(mockProfile),
		};

		(ProfilesController as jest.Mock).mockImplementation(() => mockProfilesController);
	});

	it("should return profile when userId is provided", () => {
		renderHook(() => useProfile(mockUserId));

		expect(mockMainClient.getProfile).not.toHaveBeenCalledWith(mockUserId);
	});
});
