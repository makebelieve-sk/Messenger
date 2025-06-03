import type { InternalAxiosRequestConfig } from "axios";
import { HTTPErrorTypes, HTTPStatuses } from "common-types";

import CatchErrors from "@core/CatchErrors";
import { type Profile } from "@core/models/Profile";
import type { AxiosErrorType } from "@custom-types/axios.types";
import { ErrorCodes, Pages } from "@custom-types/enums";
import { type IUser } from "@custom-types/models.types";
import useAuthStore from "../../__mocks__/@store/auth";
import useGlobalStore from "../../__mocks__/@store/global";
import resetAllStores from "../../__mocks__/@store/index";
import useProfileStore from "../../__mocks__/@store/profile";
import useUIStore from "../../__mocks__/@store/ui";

// eslint-disable-next-line no-console
const originalConsoleError = console.error;
beforeAll(() => {
	// eslint-disable-next-line no-console
	console.error = jest.fn();
});

afterAll(() => {
	// eslint-disable-next-line no-console
	console.error = originalConsoleError;
});

const mockAuthStore = {
	setSignUpErrors: jest.fn(),
	setSignInErrors: jest.fn(),
	setSignInLoading: jest.fn(),
	setSignUpLoading: jest.fn(),
	setChooseAvatarLoading: jest.fn(),
	reset: jest.fn(),
	signUpErrors: null,
	signInErrors: false,
	signInLoading: false,
	signUpLoading: false,
	chooseAvatarLoading: false,
};

const mockGlobalStore = {
	setRedirectTo: jest.fn(),
	redirectTo: Pages.signIn,
	onlineUsers: new Map<string, IUser>(),
	addOnlineUsers: jest.fn(),
	setOnlineUsers: jest.fn(),
	deleteOnlineUser: jest.fn(),
	reset: jest.fn(),
	getState: () => mockGlobalStore,
};

const mockProfileStore = {
	setEditErrors: jest.fn(),
	showEditAlert: false,
	isEditLoading: false,
	isDeleteAvatarLoading: false,
	isDeleteAccountLoading: false,
	editErrors: undefined as { field?: string; fields?: string[]; } | undefined,
	isPrepareAnotherUser: true,
	profile: null as Profile | null,
	isMe: false,
	setShowEditAlert: jest.fn(),
	setEditLoading: jest.fn(),
	setDeleteAvatarLoading: jest.fn(),
	setDeleteAccountLoading: jest.fn(),
	setPrepareAnotherUser: jest.fn(),
	setProfile: jest.fn(),
	setIsMe: jest.fn(),
	reset: jest.fn(),
};

const mockUIStore = {
	setError: jest.fn(),
	setSnackbarError: jest.fn(),
	error: null,
	snackbarError: null,
	confirmModal: null,
	settingsModal: false,
	saveSettingsModal: false,
	isSettingsOpen: false,
	isConfirmOpen: false,
	isSnackbarOpen: false,
	setConfirmModal: jest.fn(),
	setSettingsModal: jest.fn(),
	setSaveSettingsModal: jest.fn(),
	reset: jest.fn(),
	getState: () => mockUIStore,
};

useAuthStore.getState = jest.fn(() => mockAuthStore);
useGlobalStore.getState = jest.fn(() => mockGlobalStore);
useProfileStore.getState = jest.fn(() => mockProfileStore);
useUIStore.getState = jest.fn(() => mockUIStore);

describe("CatchErrors", () => {
	let catchErrors: CatchErrors;

	beforeEach(() => {
		catchErrors = new CatchErrors();
		jest.clearAllMocks();
	});

	describe("catchAxios", () => {
		it("should handle 308 Permanent Redirect", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.PermanentRedirect,
					statusText: "Permanent Redirect",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: { 
						message: "Redirect",
						success: false,
						options: {
							type: HTTPErrorTypes.SIGN_IN,
						},
					},
				},
				message: "Redirect",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockGlobalStore.setRedirectTo).toHaveBeenCalledWith(Pages.profile);
		});

		it("should handle 400 Bad Request for SIGN_UP", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.BadRequest,
					statusText: "Bad Request",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: {
						message: "Bad Request",
						success: false,
						options: {
							type: HTTPErrorTypes.SIGN_UP,
							fields: [ "email", "password" ],
						},
					},
				},
				message: "Bad Request",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockAuthStore.setSignUpErrors).toHaveBeenCalledWith({
				status: HTTPStatuses.BadRequest,
				fields: [ "email", "password" ],
			});
		});

		it("should handle 400 Bad Request for EDIT_INFO", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.BadRequest,
					statusText: "Bad Request",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: {
						message: "Bad Request",
						success: false,
						options: {
							type: HTTPErrorTypes.EDIT_INFO,
							field: "username",
							fields: [ "username", "email" ],
						},
					},
				},
				message: "Bad Request",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockProfileStore.setEditErrors).toHaveBeenCalledWith({
				field: "username",
				fields: [ "username", "email" ],
			});
		});

		it("should handle 401 Unauthorized for SIGN_IN", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.Unauthorized,
					statusText: "Unauthorized",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: {
						message: "Unauthorized",
						success: false,
						options: {
							type: HTTPErrorTypes.SIGN_IN,
						},
					},
				},
				message: "Unauthorized",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockAuthStore.setSignInErrors).toHaveBeenCalledWith(true);
		});

		it("should handle 401 Unauthorized for other types", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.Unauthorized,
					statusText: "Unauthorized",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: {
						message: "Unauthorized",
						success: false,
						options: {
							type: HTTPErrorTypes.EDIT_INFO,
						},
					},
				},
				message: "Unauthorized",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(resetAllStores).toHaveBeenCalled();
		});

		it("should handle 403 Forbidden", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.Forbidden,
					statusText: "Forbidden",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: { 
						message: "Forbidden",
						success: false,
						options: {
							type: HTTPErrorTypes.SIGN_IN,
						},
					},
				},
				message: "Forbidden",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(resetAllStores).toHaveBeenCalled();
		});

		it("should handle 404 Not Found", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.NotFound,
					statusText: "Not Found",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: { 
						message: "Not Found",
						success: false,
						options: {
							type: HTTPErrorTypes.SIGN_IN,
						},
					},
				},
				message: "Not Found",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setError).toHaveBeenCalled();
		});

		it("should handle 409 Conflict for SIGN_UP", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.Conflict,
					statusText: "Conflict",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: {
						message: "Conflict",
						success: false,
						options: {
							type: HTTPErrorTypes.SIGN_UP,
							field: "email",
						},
					},
				},
				message: "Conflict",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockAuthStore.setSignUpErrors).toHaveBeenCalledWith({
				status: HTTPStatuses.Conflict,
				field: "email",
				message: "Conflict",
			});
		});

		it("should handle 413 Payload Too Large", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.PayloadTooLarge,
					statusText: "Payload Too Large",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: { 
						message: "File size too large",
						success: false,
						options: {
							type: HTTPErrorTypes.SIGN_IN,
						},
					},
				},
				message: "Payload Too Large",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setSnackbarError).toHaveBeenCalledWith("File size too large");
		});

		it("should handle 429 Too Many Requests", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.TooManyRequests,
					statusText: "Too Many Requests",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: { 
						message: "Too Many Requests",
						success: false,
						options: {
							type: HTTPErrorTypes.SIGN_IN,
						},
					},
				},
				message: "Too Many Requests",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setSnackbarError).toHaveBeenCalledWith("Too Many Requests");
		});

		it("should handle 500 Server Error", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.ServerError,
					statusText: "Server Error",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: { 
						message: "Server Error",
						success: false,
						options: {
							type: HTTPErrorTypes.SIGN_IN,
						},
					},
				},
				message: "Server Error",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setError).toHaveBeenCalled();
		});

		it("should handle network error", () => {
			const axiosError: AxiosErrorType = {
				code: ErrorCodes.ERR_NETWORK,
				message: "Network Error",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setError).toHaveBeenCalled();
		});

		it("should handle timeout error", () => {
			const axiosError: AxiosErrorType = {
				code: ErrorCodes.ERR_TIMEOUT,
				message: "Timeout Error",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setError).toHaveBeenCalled();
		});

		it("should handle canceled request", () => {
			const axiosError: AxiosErrorType = {
				code: ErrorCodes.ERR_CANCELED,
				message: "Request Canceled",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setError).toHaveBeenCalled();
		});

		it("should handle unknown error", () => {
			const axiosError: AxiosErrorType = {
				code: "UNKNOWN",
				message: "Unknown Error",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setError).toHaveBeenCalled();
		});

		it("should handle system error", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.ServerError,
					statusText: "Internal Server Error",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: { 
						message: "System error occurred",
						success: false,
						options: {
							type: HTTPErrorTypes.SIGN_IN,
						},
					},
				},
				message: "Internal Server Error",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setError).toHaveBeenCalledWith("System error occurred");
		});

		it("should handle empty axios response", () => {
			const axiosError: AxiosErrorType = {
				message: "Custom error message",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setError).toHaveBeenCalledWith("Custom error message");
		});

		it("should handle ERR_BAD_REQUEST error code", () => {
			const axiosError: AxiosErrorType = {
				code: ErrorCodes.ERR_BAD_REQUEST,
				message: "Bad Request",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			// eslint-disable-next-line max-len
			expect(mockUIStore.setError).toHaveBeenCalledWith("The error occurred when trying to make a request to the server. The server is most likely unavailable at the moment. Check your internet connection.");
		});

		it("should handle default error case in _badRequest", () => {
			const axiosError: AxiosErrorType = {
				response: {
					status: HTTPStatuses.BadRequest,
					statusText: "Bad Request",
					headers: {},
					config: {} as InternalAxiosRequestConfig,
					data: {
						message: "Bad Request",
						success: false,
						options: {
							type: HTTPErrorTypes.SIGN_IN,
						},
					},
				},
				message: "Bad Request",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setError).toHaveBeenCalled();
		});

		it("should handle default error case in _errorHandler", () => {
			const axiosError: AxiosErrorType = {
				code: "UNKNOWN_ERROR_CODE",
				message: "Some unknown error occurred",
				isAxiosError: true,
				toJSON: () => ({}),
				name: "AxiosError",
			};

			catchErrors.catchAxios(axiosError);
			expect(mockUIStore.setError).toHaveBeenCalledWith(expect.stringContaining("Some unknown error occurred"));
		});
	});
});
