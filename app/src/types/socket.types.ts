import { MessageReadStatus, SocketActions } from "common-types";
import { type Socket } from "socket.io-client";

import type { IMessage, IUser } from "@custom-types/models.types";

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

interface IAck {
	success: boolean;
	message?: string;
	timestamp?: number;
};
type CallbackAckType = (ack: IAck) => void;

// Отправляем события с клиента на сервер
interface ClientToServerEvents {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[SocketActions.NOTIFY_WRITE]: ({ isWrite, chatId, usersInChat }: { isWrite: boolean; chatId: string; usersInChat: any[]; }) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[SocketActions.MESSAGE]: ({ data, usersInChat }: { data: IMessage; usersInChat: any[]; }) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[SocketActions.EDIT_MESSAGE]: ({ data }: { data: any; usersInChat: any[]; }) => void;
	[SocketActions.DELETE_MESSAGE]: ({ companionId, messageId }: { companionId: string; messageId: string; }) => void;
	[SocketActions.DELETE_CHAT]: ({ companionId, chatId }: { companionId: string; chatId: string; }) => void;
	[SocketActions.CHANGE_READ_STATUS]: ({ isRead, messages }: { isRead: MessageReadStatus; messages: IMessage[]; }) => void;
};

// Отправляем события с сервера на клиент
interface ServerToClientEvents {
	[SocketActions.GET_ALL_USERS]: ({ users }: { users: IUser[]; }, callback: CallbackAckType) => void;
	[SocketActions.GET_NEW_USER]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.USER_DISCONNECT]: ({ userId }: { userId: string; }, callback: CallbackAckType) => void;
	[SocketActions.LOG_OUT]: (data: undefined, callback: CallbackAckType) => void;

	[SocketActions.FOLLOW_FRIEND]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.ADD_OUTGOING_REQUEST]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.UNFOLLOW_FRIEND]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.REMOVE_OUTGOING_REQUEST]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.ADD_TO_FRIEND]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.REMOVE_FOLLOWER]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.ADD_FRIEND_REQUEST]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.REMOVE_FRIEND_REQUEST]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.REJECT_FRIEND_REQUEST]: ({ userId }: { userId: string; }, callback: CallbackAckType) => void;
	[SocketActions.ADD_TO_FOLLOWER]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.DELETE_FRIEND]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.DELETING_FRIEND]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.BLOCK_FRIEND]: ({ userId }: { userId: string; }, callback: CallbackAckType) => void;
	[SocketActions.BLOCKING_FRIEND]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.UNBLOCK_FRIEND]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;
	[SocketActions.UNBLOCKING_FRIEND]: ({ user }: { user: IUser; }, callback: CallbackAckType) => void;

	[SocketActions.SOCKET_CHANNEL_ERROR]: ({ message }: { message: string; }, callback: CallbackAckType) => void;

	[SocketActions.NOTIFY_WRITE]: ({ isWrite, chatId, userName }: { isWrite: boolean; chatId: string; userName: string; }, callback: CallbackAckType) => void;
	[SocketActions.SEND_MESSAGE]: ({ message }: { message: IMessage; }, callback: CallbackAckType) => void;
	[SocketActions.EDIT_MESSAGE]: ({ data }: { data: IMessage; }, callback: CallbackAckType) => void;
	[SocketActions.DELETE_MESSAGE]: ({ messageId }: { messageId: string; }, callback: CallbackAckType) => void;
	[SocketActions.DELETE_CHAT]: ({ chatId }: { chatId: string; }, callback: CallbackAckType) => void;
	[SocketActions.ACCEPT_CHANGE_READ_STATUS]: ({ message }: { message: IMessage; }, callback: CallbackAckType) => void;
};

export type { SocketType, ClientToServerEvents, ServerToClientEvents, CallbackAckType };
