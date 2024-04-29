import { ICallSettings } from "./call.types";
import { MessageExt } from "./message.types";
import { UserPartial } from "./user.types";

export interface IFullChatInfo {
    chatId: string;
    initiatorId: string;
    chatName: string;
    chatAvatar: string;
    chatSettings: ICallSettings;
    isSingle: boolean;
};

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