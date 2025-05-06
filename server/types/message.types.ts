import { MessageTypes } from "common-types";

import { type IFile } from "@custom-types/models.types";

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
	messageAuthor: { id: string; avatarUrl: string } | undefined;
	chatSoundStatus: boolean;
};