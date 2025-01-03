export const CLIENT_URL = process.env.REACT_APP_CLIENT_URL as string;
export const SERVER_URL = process.env.REACT_APP_SERVER_URL as string;
export const COOKIE_NAME = process.env.REACT_APP_COOKIE_NAME as string;
export const SOCKET_IO_CLIENT = process.env.REACT_APP_SOCKET_IO_CLIENT as string;
export const MAIL_FEEDBACK = process.env.REACT_APP_MAIL_FEEDBACK as string;
export const TIMEOUT_IS_WRITE_MESSAGE = parseInt(process.env.REACT_APP_TIMEOUT_IS_WRITE_MESSAGE as string);
export const TIMEOUT_HIDE_UPPER_DATE = parseInt(process.env.REACT_APP_TIMEOUT_HIDE_UPPER_DATE as string);
export const AXIOS_RESPONSE_ENCODING = process.env.REACT_APP_AXIOS_RESPONSE_ENCODING as string;
export const AXIOS_TIMEOUT = parseInt(process.env.REACT_APP_AXIOS_TIMEOUT as string);
export const RECONECTION_ATTEMPTS = parseInt(process.env.REACT_APP_RECONECTION_ATTEMPTS as string);
export const RECONNECTION_DELAY = parseInt(process.env.REACT_APP_RECONNECTION_DELAY as string);

export const NO_PHOTO = "/public/assets/images/noAvatar.jpg";
export const REQUIRED_FIELD = "Заполните поле";
export const MY_ID = "me";