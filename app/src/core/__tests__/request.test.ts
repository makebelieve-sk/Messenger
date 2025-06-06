import axios, { AxiosAdapter, AxiosHeaders, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ApiRoutes, HTTPErrorTypes, HTTPStatuses } from "common-types";

import CatchErrors from "@core/CatchErrors";
import Request from "@core/Request";
import type { AxiosResponseType } from "@custom-types/axios.types";
import useUIStore from "../../__mocks__/@store/ui";

jest.mock("axios");
jest.mock("@store/ui");
jest.mock("@core/CatchErrors");

describe("Request", () => {
	let request: Request;
	let mockCatchErrors: jest.Mocked<CatchErrors>;
	let mockAxios: jest.Mocked<AxiosInstance>;

	beforeEach(() => {
		mockCatchErrors = new CatchErrors() as jest.Mocked<CatchErrors>;
		mockAxios = {
			get: jest.fn(),
			post: jest.fn(),
			put: jest.fn(),
		} as unknown as jest.Mocked<AxiosInstance>;
        
		(axios.create as jest.Mock).mockReturnValue(mockAxios);
		request = new Request(mockCatchErrors);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("get", () => {
		const mockRoute = "/api/user";
		const mockResponse: AxiosResponseType = { 
			status: HTTPStatuses.OK,
			statusText: "OK",
			headers: {},
			config: {
				headers: new AxiosHeaders(),
				url: mockRoute,
				method: "get",
				baseURL: "",
				transformRequest: [],
				transformResponse: [],
				timeout: 0,
				xsrfCookieName: "",
				xsrfHeaderName: "",
				maxContentLength: 0,
				maxBodyLength: 0,
				validateStatus: () => true,
				withCredentials: false,
				adapter: (() => Promise.resolve({
					data: {},
					status: 200,
					statusText: "OK",
					headers: new AxiosHeaders(),
					config: {} as InternalAxiosRequestConfig,
				})) as AxiosAdapter,
				responseType: "json",
				responseEncoding: "utf8",
				params: {},
				paramsSerializer: () => "",
				data: undefined,
				auth: undefined,
				cancelToken: undefined,
				signal: undefined,
				decompress: true,
				proxy: undefined,
				transitional: {
					silentJSONParsing: true,
					forcedJSONParsing: true,
					clarifyTimeoutError: false,
				},
			},
			data: { 
				success: true, 
				message: "Success",
				options: {
					type: HTTPErrorTypes.SIGN_IN,
				},
			},
		};
		const mockSetLoading = jest.fn();
		const mockSuccessCb = jest.fn();

		it("should make successful GET request", async () => {
			mockAxios.get.mockResolvedValue(mockResponse);

			request.get({ route: mockRoute, setLoading: mockSetLoading, successCb: mockSuccessCb });

			expect(mockSetLoading).toHaveBeenCalledWith(true);
            
			await new Promise(resolve => setTimeout(resolve, 0));
            
			expect(mockSuccessCb).toHaveBeenCalledWith(mockResponse.data);
			expect(mockSetLoading).toHaveBeenCalledWith(false);
		});

		it("should handle GET request without callback", async () => {
			mockAxios.get.mockResolvedValue(mockResponse);

			request.get({ route: mockRoute, setLoading: mockSetLoading });

			expect(mockSetLoading).toHaveBeenCalledWith(true);
            
			await new Promise(resolve => setTimeout(resolve, 0));
            
			expect(mockSuccessCb).not.toHaveBeenCalled();
			expect(mockSetLoading).toHaveBeenCalledWith(false);
		});

		it("should handle GET request error", async () => {
			const mockError = new Error("Network error");
			mockAxios.get.mockRejectedValue(mockError);

			request.get({ route: mockRoute });

			await new Promise(resolve => setTimeout(resolve, 0));
			expect(mockCatchErrors.catchAxios).toHaveBeenCalledWith(mockError);
		});
	});

	describe("post", () => {
		const mockRoute = "/api/user";
		const mockData = { name: "test" };
		const mockResponse: AxiosResponseType = { 
			status: HTTPStatuses.Created,
			statusText: "Created",
			headers: {},
			config: {
				headers: new AxiosHeaders(),
				url: mockRoute,
				method: "post",
				baseURL: "",
				transformRequest: [],
				transformResponse: [],
				timeout: 0,
				xsrfCookieName: "",
				xsrfHeaderName: "",
				maxContentLength: 0,
				maxBodyLength: 0,
				validateStatus: () => true,
				withCredentials: false,
				adapter: (() => Promise.resolve({
					data: {},
					status: 200,
					statusText: "OK",
					headers: new AxiosHeaders(),
					config: {} as InternalAxiosRequestConfig,
				})) as AxiosAdapter,
				responseType: "json",
				responseEncoding: "utf8",
				params: {},
				paramsSerializer: () => "",
				data: undefined,
				auth: undefined,
				cancelToken: undefined,
				signal: undefined,
				decompress: true,
				proxy: undefined,
				transitional: {
					silentJSONParsing: true,
					forcedJSONParsing: true,
					clarifyTimeoutError: false,
				},
			},
			data: { 
				success: true, 
				message: "Created",
				options: {
					type: HTTPErrorTypes.SIGN_UP,
				},
			},
		};
		const mockSetLoading = jest.fn();
		const mockSuccessCb = jest.fn();

		it("should make successful POST request", async () => {
			mockAxios.post.mockResolvedValue(mockResponse);

			request.post({ route: mockRoute as ApiRoutes, data: mockData, setLoading: mockSetLoading, successCb: mockSuccessCb });

			expect(mockSetLoading).toHaveBeenCalledWith(true);
            
			await new Promise(resolve => setTimeout(resolve, 0));
            
			expect(mockSuccessCb).toHaveBeenCalledWith(mockResponse.data);
			expect(mockSetLoading).toHaveBeenCalledWith(false);
		});

		it("should handle POST request without callback", async () => {
			mockAxios.post.mockResolvedValue(mockResponse);

			request.post({ route: mockRoute as ApiRoutes, data: mockData, setLoading: mockSetLoading });

			expect(mockSetLoading).toHaveBeenCalledWith(true);
            
			await new Promise(resolve => setTimeout(resolve, 0));
            
			expect(mockSuccessCb).not.toHaveBeenCalled();
			expect(mockSetLoading).toHaveBeenCalledWith(false);
		});

		it("should handle POST request with config", async () => {
			const mockConfig = { headers: { "Content-Type": "multipart/form-data" } };
			mockAxios.post.mockResolvedValue(mockResponse);

			request.post({ 
				route: mockRoute as ApiRoutes, 
				data: mockData, 
				setLoading: mockSetLoading, 
				successCb: mockSuccessCb,
				config: mockConfig, 
			});

			expect(mockSetLoading).toHaveBeenCalledWith(true);
            
			await new Promise(resolve => setTimeout(resolve, 0));
            
			expect(mockAxios.post).toHaveBeenCalledWith(mockRoute, mockData, mockConfig);
			expect(mockSuccessCb).toHaveBeenCalledWith(mockResponse.data);
			expect(mockSetLoading).toHaveBeenCalledWith(false);
		});

		it("should handle POST request error", async () => {
			const mockError = new Error("Network error");
			mockAxios.post.mockRejectedValue(mockError);

			request.post({ route: mockRoute as ApiRoutes, data: mockData });

			await new Promise(resolve => setTimeout(resolve, 0));
			expect(mockCatchErrors.catchAxios).toHaveBeenCalledWith(mockError);
		});
	});

	describe("put", () => {
		const mockRoute = "/api/user";
		const mockData = { name: "updated" };
		const mockResponse: AxiosResponseType = { 
			status: HTTPStatuses.OK,
			statusText: "OK",
			headers: {},
			config: {
				headers: new AxiosHeaders(),
				url: mockRoute,
				method: "put",
				baseURL: "",
				transformRequest: [],
				transformResponse: [],
				timeout: 0,
				xsrfCookieName: "",
				xsrfHeaderName: "",
				maxContentLength: 0,
				maxBodyLength: 0,
				validateStatus: () => true,
				withCredentials: false,
				adapter: (() => Promise.resolve({
					data: {},
					status: 200,
					statusText: "OK",
					headers: new AxiosHeaders(),
					config: {} as InternalAxiosRequestConfig,
				})) as AxiosAdapter,
				responseType: "json",
				responseEncoding: "utf8",
				params: {},
				paramsSerializer: () => "",
				data: undefined,
				auth: undefined,
				cancelToken: undefined,
				signal: undefined,
				decompress: true,
				proxy: undefined,
				transitional: {
					silentJSONParsing: true,
					forcedJSONParsing: true,
					clarifyTimeoutError: false,
				},
			},
			data: { 
				success: true, 
				message: "Updated",
				options: {
					type: HTTPErrorTypes.EDIT_INFO,
				},
			},
		};
		const mockSetLoading = jest.fn();
		const mockSuccessCb = jest.fn();

		it("should make successful PUT request", async () => {
			mockAxios.put.mockResolvedValue(mockResponse);

			request.put({ route: mockRoute as ApiRoutes, data: mockData, setLoading: mockSetLoading, successCb: mockSuccessCb });

			expect(mockSetLoading).toHaveBeenCalledWith(true);
            
			await new Promise(resolve => setTimeout(resolve, 0));
            
			expect(mockSuccessCb).toHaveBeenCalledWith(mockResponse.data);
			expect(mockSetLoading).toHaveBeenCalledWith(false);
		});

		it("should handle PUT request without callback", async () => {
			mockAxios.put.mockResolvedValue(mockResponse);

			request.put({ route: mockRoute as ApiRoutes, data: mockData, setLoading: mockSetLoading });

			expect(mockSetLoading).toHaveBeenCalledWith(true);
            
			await new Promise(resolve => setTimeout(resolve, 0));
            
			expect(mockSuccessCb).not.toHaveBeenCalled();
			expect(mockSetLoading).toHaveBeenCalledWith(false);
		});

		it("should handle PUT request error", async () => {
			const mockError = new Error("Network error");
			mockAxios.put.mockRejectedValue(mockError);

			request.put({ route: mockRoute as ApiRoutes, data: mockData });

			await new Promise(resolve => setTimeout(resolve, 0));
			expect(mockCatchErrors.catchAxios).toHaveBeenCalledWith(mockError);
		});
	});

	describe("downloadFile", () => {
		const mockParams = "fileId=123";
		const mockExtra = { name: "test.pdf" };
		const mockBlob = new Blob([ "test" ], { type: "application/pdf" });
		const mockRoute = "/api/download";
		const mockResponse: AxiosResponse<Blob> = { 
			status: HTTPStatuses.OK,
			statusText: "OK",
			headers: {},
			config: {
				headers: new AxiosHeaders(),
				url: mockRoute,
				method: "get",
				baseURL: "",
				transformRequest: [],
				transformResponse: [],
				timeout: 0,
				xsrfCookieName: "",
				xsrfHeaderName: "",
				maxContentLength: 0,
				maxBodyLength: 0,
				validateStatus: () => true,
				withCredentials: false,
				adapter: (() => Promise.resolve({
					data: {},
					status: 200,
					statusText: "OK",
					headers: new AxiosHeaders(),
					config: {} as InternalAxiosRequestConfig,
				})) as AxiosAdapter,
				responseType: "json",
				responseEncoding: "utf8",
				params: {},
				paramsSerializer: () => "",
				data: undefined,
				auth: undefined,
				cancelToken: undefined,
				signal: undefined,
				decompress: true,
				proxy: undefined,
				transitional: {
					silentJSONParsing: true,
					forcedJSONParsing: true,
					clarifyTimeoutError: false,
				},
			},
			data: mockBlob,
		};

		beforeEach(() => {
			URL.createObjectURL = jest.fn();
			document.body.appendChild = jest.fn();
			document.body.removeChild = jest.fn();
		});

		it("should download file successfully", async () => {
			mockAxios.get.mockResolvedValue(mockResponse);

			const mockLink = {
				click: jest.fn(),
				remove: jest.fn(),
			};
			document.createElement = jest.fn().mockReturnValue(mockLink);

			request.downloadFile({ params: mockParams, extra: mockExtra });

			await new Promise(resolve => setTimeout(resolve, 0));
			expect(mockLink.click).toHaveBeenCalled();
			expect(mockLink.remove).toHaveBeenCalled();
		});

		it("should handle download file error", async () => {
			const mockError = new Error("Download failed");
			mockAxios.get.mockRejectedValue(mockError);

			request.downloadFile({ params: mockParams, extra: mockExtra });

			await new Promise(resolve => setTimeout(resolve, 0));
			expect(mockCatchErrors.catchAxios).toHaveBeenCalledWith(mockError);
		});
	});

	describe("_handleSuccessStatuses", () => {
		const mockSetError = jest.fn();
		const mockSuccessCb = jest.fn();
		const mockRoute = "/api/test";

		beforeEach(() => {
			(useUIStore.getState as jest.Mock).mockReturnValue({ setError: mockSetError });
		});

		it("should handle OK status with success data", () => {
			const response: AxiosResponseType = { 
				status: HTTPStatuses.OK,
				statusText: "OK",
				headers: {},
				config: {
					headers: new AxiosHeaders(),
					url: mockRoute,
					method: "get",
					baseURL: "",
					transformRequest: [],
					transformResponse: [],
					timeout: 0,
					xsrfCookieName: "",
					xsrfHeaderName: "",
					maxContentLength: 0,
					maxBodyLength: 0,
					validateStatus: () => true,
					withCredentials: false,
					adapter: (() => Promise.resolve({
						data: {},
						status: 200,
						statusText: "OK",
						headers: new AxiosHeaders(),
						config: {} as InternalAxiosRequestConfig,
					})) as AxiosAdapter,
					responseType: "json",
					responseEncoding: "utf8",
					params: {},
					paramsSerializer: () => "",
					data: undefined,
					auth: undefined,
					cancelToken: undefined,
					signal: undefined,
					decompress: true,
					proxy: undefined,
					transitional: {
						silentJSONParsing: true,
						forcedJSONParsing: true,
						clarifyTimeoutError: false,
					},
				},
				data: { 
					success: true, 
					message: "Success",
					options: {
						type: HTTPErrorTypes.SIGN_IN,
					},
				},
			};
			request["_handleSuccessStatuses"](response, mockSuccessCb);
			expect(mockSuccessCb).toHaveBeenCalledWith(response.data);
		});

		it("should handle Created status with success data", () => {
			const response: AxiosResponseType = { 
				status: HTTPStatuses.Created,
				statusText: "Created",
				headers: {},
				config: {
					headers: new AxiosHeaders(),
					url: mockRoute,
					method: "post",
					baseURL: "",
					transformRequest: [],
					transformResponse: [],
					timeout: 0,
					xsrfCookieName: "",
					xsrfHeaderName: "",
					maxContentLength: 0,
					maxBodyLength: 0,
					validateStatus: () => true,
					withCredentials: false,
					adapter: (() => Promise.resolve({
						data: {},
						status: 200,
						statusText: "OK",
						headers: new AxiosHeaders(),
						config: {} as InternalAxiosRequestConfig,
					})) as AxiosAdapter,
					responseType: "json",
					responseEncoding: "utf8",
					params: {},
					paramsSerializer: () => "",
					data: undefined,
					auth: undefined,
					cancelToken: undefined,
					signal: undefined,
					decompress: true,
					proxy: undefined,
					transitional: {
						silentJSONParsing: true,
						forcedJSONParsing: true,
						clarifyTimeoutError: false,
					},
				},
				data: { 
					success: true, 
					message: "Created",
					options: {
						type: HTTPErrorTypes.SIGN_UP,
					},
				},
			};
			request["_handleSuccessStatuses"](response, mockSuccessCb);
			expect(mockSuccessCb).toHaveBeenCalledWith(response.data);
		});

		it("should handle NoContent status with callback", () => {
			const response: AxiosResponseType = { 
				status: HTTPStatuses.NoContent,
				statusText: "No Content",
				headers: {},
				config: {
					headers: new AxiosHeaders(),
					url: mockRoute,
					method: "put",
					baseURL: "",
					transformRequest: [],
					transformResponse: [],
					timeout: 0,
					xsrfCookieName: "",
					xsrfHeaderName: "",
					maxContentLength: 0,
					maxBodyLength: 0,
					validateStatus: () => true,
					withCredentials: false,
					adapter: (() => Promise.resolve({
						data: {},
						status: 200,
						statusText: "OK",
						headers: new AxiosHeaders(),
						config: {} as InternalAxiosRequestConfig,
					})) as AxiosAdapter,
					responseType: "json",
					responseEncoding: "utf8",
					params: {},
					paramsSerializer: () => "",
					data: undefined,
					auth: undefined,
					cancelToken: undefined,
					signal: undefined,
					decompress: true,
					proxy: undefined,
					transitional: {
						silentJSONParsing: true,
						forcedJSONParsing: true,
						clarifyTimeoutError: false,
					},
				},
				data: { 
					success: true, 
					message: "No Content",
					options: {
						type: HTTPErrorTypes.EDIT_INFO,
					},
				},
			};
			request["_handleSuccessStatuses"](response, mockSuccessCb);
			expect(mockSuccessCb).toHaveBeenCalled();
			expect(mockSuccessCb).not.toHaveBeenCalledWith(expect.anything());
		});

		it("should handle NoContent status without callback", () => {
			const response: AxiosResponseType = { 
				status: HTTPStatuses.NoContent,
				statusText: "No Content",
				headers: {},
				config: {
					headers: new AxiosHeaders(),
					url: mockRoute,
					method: "put",
					baseURL: "",
					transformRequest: [],
					transformResponse: [],
					timeout: 0,
					xsrfCookieName: "",
					xsrfHeaderName: "",
					maxContentLength: 0,
					maxBodyLength: 0,
					validateStatus: () => true,
					withCredentials: false,
					adapter: (() => Promise.resolve({
						data: {},
						status: 200,
						statusText: "OK",
						headers: new AxiosHeaders(),
						config: {} as InternalAxiosRequestConfig,
					})) as AxiosAdapter,
					responseType: "json",
					responseEncoding: "utf8",
					params: {},
					paramsSerializer: () => "",
					data: undefined,
					auth: undefined,
					cancelToken: undefined,
					signal: undefined,
					decompress: true,
					proxy: undefined,
					transitional: {
						silentJSONParsing: true,
						forcedJSONParsing: true,
						clarifyTimeoutError: false,
					},
				},
				data: { 
					success: true, 
					message: "No Content",
					options: {
						type: HTTPErrorTypes.EDIT_INFO,
					},
				},
			};
			request["_handleSuccessStatuses"](response);
			expect(mockSuccessCb).not.toHaveBeenCalled();
		});

		it("should handle unknown status", () => {
			const response: AxiosResponseType = { 
				status: 999,
				statusText: "Unknown",
				headers: {},
				config: {
					headers: new AxiosHeaders(),
					url: mockRoute,
					method: "get",
					baseURL: "",
					transformRequest: [],
					transformResponse: [],
					timeout: 0,
					xsrfCookieName: "",
					xsrfHeaderName: "",
					maxContentLength: 0,
					maxBodyLength: 0,
					validateStatus: () => true,
					withCredentials: false,
					adapter: (() => Promise.resolve({
						data: {},
						status: 200,
						statusText: "OK",
						headers: new AxiosHeaders(),
						config: {} as InternalAxiosRequestConfig,
					})) as AxiosAdapter,
					responseType: "json",
					responseEncoding: "utf8",
					params: {},
					paramsSerializer: () => "",
					data: undefined,
					auth: undefined,
					cancelToken: undefined,
					signal: undefined,
					decompress: true,
					proxy: undefined,
					transitional: {
						silentJSONParsing: true,
						forcedJSONParsing: true,
						clarifyTimeoutError: false,
					},
				},
				data: { 
					success: true, 
					message: "Unknown",
					options: {
						type: HTTPErrorTypes.SIGN_IN,
					},
				},
			};
			request["_handleSuccessStatuses"](response, mockSuccessCb);
			expect(mockSetError).toHaveBeenCalled();
			expect(mockSuccessCb).not.toHaveBeenCalled();
		});

		it("should not call callback when success is false", () => {
			const response: AxiosResponseType = { 
				status: HTTPStatuses.OK,
				statusText: "OK",
				headers: {},
				config: {
					headers: new AxiosHeaders(),
					url: mockRoute,
					method: "get",
					baseURL: "",
					transformRequest: [],
					transformResponse: [],
					timeout: 0,
					xsrfCookieName: "",
					xsrfHeaderName: "",
					maxContentLength: 0,
					maxBodyLength: 0,
					validateStatus: () => true,
					withCredentials: false,
					adapter: (() => Promise.resolve({
						data: {},
						status: 200,
						statusText: "OK",
						headers: new AxiosHeaders(),
						config: {} as InternalAxiosRequestConfig,
					})) as AxiosAdapter,
					responseType: "json",
					responseEncoding: "utf8",
					params: {},
					paramsSerializer: () => "",
					data: undefined,
					auth: undefined,
					cancelToken: undefined,
					signal: undefined,
					decompress: true,
					proxy: undefined,
					transitional: {
						silentJSONParsing: true,
						forcedJSONParsing: true,
						clarifyTimeoutError: false,
					},
				},
				data: { 
					success: false, 
					message: "Error",
					options: {
						type: HTTPErrorTypes.SIGN_IN,
					},
				},
			};
			request["_handleSuccessStatuses"](response, mockSuccessCb);
			expect(mockSuccessCb).not.toHaveBeenCalled();
		});
	});
});
