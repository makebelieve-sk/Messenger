import type { AxiosError, AxiosResponse } from "axios";

import { HTTPErrorTypes } from "@custom-types/enums";

interface IResponseData {
	success: boolean;
	message: string;
	options: {
		type: HTTPErrorTypes;
		field?: string;
		fields?: string[];
	};
};

export type AxiosErrorType = AxiosError<IResponseData>;
export type AxiosResponseType = AxiosResponse<IResponseData>;
