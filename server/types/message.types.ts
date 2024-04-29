import { MessageTypes } from "./enums";
import { ICall, IFile } from "./models.types";

export interface IEditMessage {
    id: string;
    type: MessageTypes;
    message: string; 
    files: IFile[];
};

export type MessageExt = {
    createDate: string;
    message: string;
    type: MessageTypes;
    files: IFile[];
    call: ICall | undefined;
    messageAuthor: { id: string; avatarUrl: string; } | undefined;
    chatSoundStatus: boolean;
};