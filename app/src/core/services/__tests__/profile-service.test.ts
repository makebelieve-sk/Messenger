import { ApiRoutes } from "common-types";

import CatchErrors from "@core/CatchErrors";
import type Request from "@core/Request";
import ProfileService from "@core/services/ProfileService";
import { type IUserData } from "@custom-types/api.types";
import useImagesCarouselStore from "../../../__mocks__/@store/images-carousel";
import useProfileStore from "../../../__mocks__/@store/profile";
import useUIStore from "../../../__mocks__/@store/ui";

jest.mock("@store/profile");
jest.mock("@store/ui");
jest.mock("@store/images-carousel");
jest.mock("@core/CatchErrors");
jest.mock("@utils/constants", () => ({
	FRIENDS_DEBOUNCE_TIMEOUT: {
		LOAD_MORE: 100,
		SEARCH: 300,
	},
}));

describe("ProfileService", () => {
	let mockRequest: Request;
	let mockUserData: IUserData;
	let profileService: ProfileService;
	let mockCatchErrors: jest.Mocked<CatchErrors>;

	beforeEach(() => {
		mockCatchErrors = new CatchErrors() as jest.Mocked<CatchErrors>;
		mockRequest = {
			get: jest.fn(),
			post: jest.fn(),
			put: jest.fn(),
			downloadFile: jest.fn(),
			_instance: {
				get: jest.fn(),
				post: jest.fn(),
				put: jest.fn(),
			},
			_catchErrors: mockCatchErrors,
			_errorHandler: jest.fn(),
			_handleSuccessStatuses: jest.fn(),
		} as unknown as Request;

		mockUserData = {
			user: {
				id: "1",
				firstName: "John",
				secondName: "Doe",
				thirdName: "Smith",
				email: "john@example.com",
				phone: "+1234567890",
				avatarUrl: "avatar.jpg",
				avatarCreateDate: new Date().toISOString(),
			},
			userDetails: {
				userId: "1",
				birthday: "1990-01-01",
				city: "New York",
				work: "Developer",
				sex: "male",
				lastSeen: new Date().toISOString(),
			},
			isMe: true,
		};

		profileService = new ProfileService(mockRequest, mockUserData);
	});

	describe("constructor", () => {
		it("should initialize with correct user data", () => {
			expect(profileService.isMe).toBe(true);
			expect(profileService.userService).toBeDefined();
			expect(profileService.photosService).toBeDefined();
		});

		it("should set isMe based on userData", () => {
			const serviceWithIsMeFalse = new ProfileService(mockRequest, { ...mockUserData, isMe: false });
			expect(serviceWithIsMeFalse.isMe).toBe(false);
		});
	});

	describe("deleteAccount", () => {
		it("should call delete account endpoint", () => {
			const mockSetDeleteAccountLoading = jest.fn();
			const mockSetSettingsModal = jest.fn();

			(useProfileStore.getState as jest.Mock).mockReturnValue({
				setDeleteAccountLoading: mockSetDeleteAccountLoading,
			});

			(useUIStore.getState as jest.Mock).mockReturnValue({
				setSettingsModal: mockSetSettingsModal,
			});

			profileService.deleteAccount();

			expect(mockRequest.get).toHaveBeenCalledWith({
				route: ApiRoutes.deleteAccount,
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
			});
		});

		it("should handle loading state and success callback", () => {
			const mockSetDeleteAccountLoading = jest.fn();
			const mockSetSettingsModal = jest.fn();

			(useProfileStore.getState as jest.Mock).mockReturnValue({
				setDeleteAccountLoading: mockSetDeleteAccountLoading,
			});

			(useUIStore.getState as jest.Mock).mockReturnValue({
				setSettingsModal: mockSetSettingsModal,
			});

			profileService.deleteAccount();

			const { setLoading, successCb } = (mockRequest.get as jest.Mock).mock.calls[0][0];
      
			if (setLoading && successCb) {
				setLoading(true);
				expect(mockSetDeleteAccountLoading).toHaveBeenCalledWith(true);

				setLoading(false);
				expect(mockSetDeleteAccountLoading).toHaveBeenCalledWith(false);

				successCb({ success: true });
				expect(mockSetDeleteAccountLoading).toHaveBeenCalledWith(false);
				expect(mockSetSettingsModal).toHaveBeenCalledWith(false);
			}
		});
	});

	describe("onSetAvatar", () => {
		it("should update avatar and add photo", () => {
			const mockChangeAvatar = jest.fn();
			const mockAddPhotoFromAvatar = jest.fn();

			jest.spyOn(profileService.userService, "changeAvatar").mockImplementation(mockChangeAvatar);
			jest.spyOn(profileService.photosService, "addPhotoFromAvatar").mockImplementation(mockAddPhotoFromAvatar);

			const newAvatar = {
				id: "1",
				userId: "1",
				path: "new-avatar.jpg",
				size: "1024",
				extension: "jpg",
				createdAt: new Date().toISOString(),
			};
			const newPhoto = {
				id: "1",
				userId: "1",
				path: "new-avatar.jpg",
				size: "1024",
				extension: "jpg",
				createdAt: new Date().toISOString(),
			};

			profileService.onSetAvatar({ newAvatar, newPhoto });

			expect(mockChangeAvatar).toHaveBeenCalledWith(newAvatar);
			expect(mockAddPhotoFromAvatar).toHaveBeenCalledWith(newPhoto);
		});
	});

	describe("onDeleteAvatar", () => {
		it("should call delete photo endpoint", () => {
			const mockSetDeleteAvatarLoading = jest.fn();
			const mockChangeAvatar = jest.fn();

			(useProfileStore.getState as jest.Mock).mockReturnValue({
				setDeleteAvatarLoading: mockSetDeleteAvatarLoading,
			});

			jest.spyOn(profileService.userService, "changeAvatar").mockImplementation(mockChangeAvatar);

			profileService.onDeleteAvatar();

			expect(mockRequest.post).toHaveBeenCalledWith({
				route: ApiRoutes.deletePhoto,
				data: { imageUrl: profileService.userService.avatarUrl },
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
			});
		});

		it("should handle loading state and success callback", () => {
			const mockSetDeleteAvatarLoading = jest.fn();
			const mockChangeAvatar = jest.fn();

			(useProfileStore.getState as jest.Mock).mockReturnValue({
				setDeleteAvatarLoading: mockSetDeleteAvatarLoading,
			});

			jest.spyOn(profileService.userService, "changeAvatar").mockImplementation(mockChangeAvatar);

			profileService.onDeleteAvatar();

			const { setLoading, successCb } = (mockRequest.post as jest.Mock).mock.calls[0][0];
      
			if (setLoading && successCb) {
				setLoading(true);
				expect(mockSetDeleteAvatarLoading).toHaveBeenCalledWith(true);

				setLoading(false);
				expect(mockSetDeleteAvatarLoading).toHaveBeenCalledWith(false);

				successCb({ success: true });
				expect(mockChangeAvatar).toHaveBeenCalled();
			}
		});
	});

	describe("onClickAvatar", () => {
		it("should set avatar in carousel store", () => {
			const mockSetAvatar = jest.fn();
			(useImagesCarouselStore.getState as jest.Mock).mockReturnValue({
				setAvatar: mockSetAvatar,
			});

			profileService.onClickAvatar();

			expect(mockSetAvatar).toHaveBeenCalledWith(true);
		});
	});

	describe("editInfo", () => {
		it("should call edit info endpoint", () => {
			const mockSetEditLoading = jest.fn();
			const mockSetShowEditAlert = jest.fn();
			const mockUpdateUser = jest.fn();

			(useProfileStore.getState as jest.Mock).mockReturnValue({
				setEditLoading: mockSetEditLoading,
				setShowEditAlert: mockSetShowEditAlert,
			});

			jest.spyOn(profileService.userService, "updateUser").mockImplementation(mockUpdateUser);

			const formValues = {
				name: "John",
				surName: "Doe",
				phone: "+1234567890",
				email: "john@example.com",
				city: "New York",
				work: "Developer",
				sex: "male",
				birthday: "1990-01-01",
			};

			profileService.editInfo(formValues);

			expect(mockRequest.put).toHaveBeenCalledWith({
				route: ApiRoutes.editInfo,
				data: { ...formValues, userId: profileService.userService.id },
				setLoading: expect.any(Function),
				successCb: expect.any(Function),
			});
		});

		it("should handle loading state and success callback", () => {
			const mockSetEditLoading = jest.fn();
			const mockSetShowEditAlert = jest.fn();
			const mockUpdateUser = jest.fn();

			(useProfileStore.getState as jest.Mock).mockReturnValue({
				setEditLoading: mockSetEditLoading,
				setShowEditAlert: mockSetShowEditAlert,
			});

			jest.spyOn(profileService.userService, "updateUser").mockImplementation(mockUpdateUser);

			const formValues = {
				name: "John",
				surName: "Doe",
				phone: "+1234567890",
				email: "john@example.com",
				city: "New York",
				work: "Developer",
				sex: "male",
				birthday: "1990-01-01",
			};

			profileService.editInfo(formValues);

			const { setLoading, successCb } = (mockRequest.put as jest.Mock).mock.calls[0][0];
      
			if (setLoading && successCb) {
				setLoading(true);
				expect(mockSetEditLoading).toHaveBeenCalledWith(true);

				setLoading(false);
				expect(mockSetEditLoading).toHaveBeenCalledWith(false);

				const mockUserData = {
					user: { id: "1", firstName: "John" },
					userDetails: { userId: "1" },
				};
				successCb(mockUserData);
				expect(mockUpdateUser).toHaveBeenCalledWith(mockUserData);
				expect(mockSetShowEditAlert).toHaveBeenCalledWith(true);
			}
		});
	});
});
