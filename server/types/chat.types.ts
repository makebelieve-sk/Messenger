import { MessageExt } from "./message.types";
import { UserPartial } from "./user.types";

export interface IChatInfo {
    chatId: string;
    chatName: string;
    chatAvatar: string;
};

export interface IDialog {
    id: string;
    name?: string;
    avatarUrl?: string;
    unReadMessageIds: string[];
    usersInChat: UserPartial[];
    messageObject: MessageExt;
};