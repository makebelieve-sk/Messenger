import i18next from "@service/i18n";

export const DEV = import.meta.env.DEV;
export const BASE_URL = import.meta.env.VITE_BASE_URL as string;
export const API_URL = import.meta.env.VITE_API_URL as string;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;
export const COOKIE_NAME = import.meta.env.VITE_COOKIE_NAME as string;
export const MAIL_FEEDBACK = import.meta.env.VITE_MAIL_FEEDBACK as string;
export const TIMEOUT_IS_WRITE_MESSAGE = parseInt(import.meta.env.VITE_TIMEOUT_IS_WRITE_MESSAGE as string);
export const TIMEOUT_HIDE_UPPER_DATE = parseInt(import.meta.env.VITE_TIMEOUT_HIDE_UPPER_DATE as string);
export const AXIOS_RESPONSE_ENCODING = import.meta.env.VITE_AXIOS_RESPONSE_ENCODING as string;
export const AXIOS_TIMEOUT = parseInt(import.meta.env.VITE_AXIOS_TIMEOUT as string);
export const SOCKET_RECONECTION_ATTEMPTS = parseInt(import.meta.env.VITE_SOCKET_RECONECTION_ATTEMPTS as string);
export const SOCKET_RECONNECTION_DELAY = parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY as string);
export const SOCKET_ACK_TIMEOUT = parseInt(import.meta.env.VITE_SOCKET_ACK_TIMEOUT as string);
export const ARRAY_LOGS_LENGTH = parseInt(import.meta.env.VITE_ARRAY_LOGS_LENGTH as string);
export const LOGS_FILE_NAME = import.meta.env.VITE_LOGS_FILE_NAME as string;

export const NO_PHOTO = "/assets/images/noPhoto.jpg";
export const REQUIRED_FIELD = i18next.t("utils.required_field");
export const MY_ID = "me";