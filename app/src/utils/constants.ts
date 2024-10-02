export const CLIENT_URL = process.env.REACT_APP_CLIENT_URL || "http://localhost:3000";
export const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:8008";
export const COOKIE_NAME = process.env.REACT_APP_COOKIE_NAME || "sid";
export const SOCKET_IO_CLIENT = process.env.REACT_APP_SOCKET_IO_CLIENT || "http://localhost:8008";
export const MAIL_FEEDBACK = process.env.REACT_APP_MAIL_FEEDBACK || "skryabin.aleksey99@gmail.com";
export const TIMEOUT_IS_WRITE_MESSAGE = process.env.REACT_APP_TIMEOUT_IS_WRITE_MESSAGE as never as number || 7000;
export const TIMEOUT_HIDE_UPPER_DATE = process.env.REACT_APP_TIMEOUT_HIDE_UPPER_DATE as never as number || 2000;

export const NO_PHOTO = "/assets/images/noAvatar.jpg";
export const REQUIRED_FIELD = "Заполните поле";
export const MY_ID = "me";