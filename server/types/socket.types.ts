import { MessageReadStatus, SocketActions } from "common-types";
import type { Server, Socket } from "socket.io";

import type SocketController from "@core/socket/SocketController";
import { type IEditMessage } from "@custom-types/message.types";
import { type IMessage } from "@custom-types/models.types";
import type { ISafeUser, UserPartial } from "@custom-types/user.types";

interface ISocketUser extends ISafeUser {
	sockets: Map<string, SocketController>;
};

type SocketType = Server<ClientToServerEvents, ServerToClientEvents>;

interface SocketWithUser extends Socket<ClientToServerEvents, ServerToClientEvents> {
	user: ISocketUser;
};

interface IAck {
	success: boolean;
	message?: string;
	timestamp?: number;
};
type CallbackAckType = (ack: IAck) => void;

// Отправляем события с клиента на сервер
interface ClientToServerEvents {
	[SocketActions.NOTIFY_WRITE]: (
		{ isWrite, chatId, usersInChat }: { isWrite: boolean; chatId: string; usersInChat: UserPartial[]; },
		callback: CallbackAckType,
	) => void;
	[SocketActions.MESSAGE]: ({ data, usersInChat }: { data: IMessage; usersInChat: UserPartial[]; }, callback: CallbackAckType) => void;
	[SocketActions.EDIT_MESSAGE]: ({ data, usersInChat }: { data: IEditMessage; usersInChat: UserPartial[]; }, callback: CallbackAckType) => void;
	[SocketActions.DELETE_MESSAGE]: ({ companionId, messageId }: { companionId: string; messageId: string; }, callback: CallbackAckType) => void;
	[SocketActions.DELETE_CHAT]: ({ companionId, chatId }: { companionId: string; chatId: string; }, callback: CallbackAckType) => void;
	[SocketActions.CHANGE_READ_STATUS]: ({ isRead, messages }: { isRead: MessageReadStatus; messages: IMessage[]; }, callback: CallbackAckType) => void;
};

// Отправляем события с сервера на клиент
interface ServerToClientEvents {
	[SocketActions.GET_ALL_USERS]: ({ users }: { users: ISocketUser[]; }) => void;
	[SocketActions.GET_NEW_USER]: ({ user }: { user: ISocketUser; }) => void;
	[SocketActions.USER_DISCONNECT]: ({ userId }: { userId: string; }) => void;
	[SocketActions.LOG_OUT]: () => void;

	[SocketActions.FOLLOW_FRIEND]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.ADD_OUTGOING_REQUEST]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.UNFOLLOW_FRIEND]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.REMOVE_OUTGOING_REQUEST]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.ADD_TO_FRIEND]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.REMOVE_FOLLOWER]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.ADD_FRIEND_REQUEST]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.REMOVE_FRIEND_REQUEST]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.REJECT_FRIEND_REQUEST]: ({ userId }: { userId: string; }) => void;
	[SocketActions.ADD_TO_FOLLOWER]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.DELETE_FRIEND]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.DELETING_FRIEND]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.BLOCK_FRIEND]: ({ userId }: { userId: string; }) => void;
	[SocketActions.BLOCKING_FRIEND]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.UNBLOCK_FRIEND]: ({ user }: { user: ISafeUser; }) => void;
	[SocketActions.UNBLOCKING_FRIEND]: ({ user }: { user: ISafeUser; }) => void;

	[SocketActions.SOCKET_CHANNEL_ERROR]: ({ message }: { message: string; }) => void;

	[SocketActions.NOTIFY_WRITE]: ({ isWrite, chatId, userName }: { isWrite: boolean; chatId: string; userName: string; }) => void;
	[SocketActions.SEND_MESSAGE]: ({ message }: { message: IMessage; }) => void;
	[SocketActions.EDIT_MESSAGE]: ({ data }: { data: IEditMessage; }) => void;
	[SocketActions.DELETE_MESSAGE]: ({ messageId }: { messageId: string; }) => void;
	[SocketActions.DELETE_CHAT]: ({ chatId }: { chatId: string; }) => void;
	[SocketActions.ACCEPT_CHANGE_READ_STATUS]: ({ message }: { message: IMessage; }) => void;
};

export type { 
	ISocketUser, 
	SocketType, 
	SocketWithUser, 
	ClientToServerEvents, 
	ServerToClientEvents, 
	IAck, 
	CallbackAckType,
};