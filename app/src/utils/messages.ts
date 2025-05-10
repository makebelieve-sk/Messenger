import { FileVarieties, MessageTypes } from "common-types";
import { v4 as uuid } from "uuid";

import Logger from "@service/Logger";
import type { IFile, IMessage } from "@custom-types/models.types";
import { isImage } from "@utils/files";

const logger = Logger.init("utils/messages");

// Обработка сообщений с файлами (разделение на отдельные сообщения)
export const handlingMessagesWithFiles = (messages: IMessage[]) => {
	logger.debug(`handlingMessagesWithFiles [messages.length=${messages.length}]`);

	return messages.reduce((acc, message) => {
		switch (message.type) {
		// Несколько файлов в сообщении
		case MessageTypes.FEW_FILES: {
			if (message.files && message.files.length) {
				// Отделяем в отдельное сообщение сам текст (от файлов и изображений)
				if (message.message) {
					acc.push({
						...message,
						type: MessageTypes.MESSAGE,
						id: uuid(),
						createDate: message.createDate,
					});
				}

				const images: IFile[] = [];

				// Отделяем файлы от картинок в разные массивы
				const files = (message.files as IFile[]).reduce((acc, file) => {
					const isFileImage = isImage(file.name);

					if (isFileImage) {
						images.push(file);
					} else {
						acc.push(file);
					}

					return acc;
				}, [] as IFile[]);

				// Формируем для каждых 10 файлов новое сообщение
				for (let i = 0; i < files.length / 10; i++) {
					acc.push({
						...message,
						type: MessageTypes.FEW_FILES,
						id: uuid(),
						files: files.slice(i * 10, i * 10 + 10),
						fileExt: FileVarieties.FILES,
					});
				}

				// Формируем для каждых 4 изображений новое сообщение
				if (images.length) {
					for (let i = 0; i < images.length / 4; i++) {
						acc.push({
							...message,
							type: MessageTypes.FEW_FILES,
							id: uuid(),
							files: images.slice(i * 4, i * 4 + 4),
							fileExt: FileVarieties.IMAGES,
						});
					}
				}
			}

			return acc;
		}

		// Один файл в сообщении
		case MessageTypes.WITH_FILE: {
			if (message.files && message.files.length) {
				const file = message.files[0] as IFile;

				const isFileImage = isImage(file.name);

				acc.push({
					...message,
					fileExt: isFileImage ? FileVarieties.IMAGES : FileVarieties.FILES,
				});

				return acc;
			}
		}

		default:
			acc.push(message);
			return acc;
		}
	}, [] as IMessage[]);
};

// Проверка на первый/последний элемент для сообщения в блоке (показ имени, аватара)
export const checkIsFirstOrLastMessage = (message: IMessage, prevMessage: IMessage | null, postMessage: IMessage | null) => {
	logger.debug(`checkIsFirstOrLastMessage [messageUserId=${message.id}, prevMessageUserId=${prevMessage?.userId}, postMessageUserId=${postMessage?.userId}]`);

	let isFirst = false;
	let isLast = false;

	/**
	 * Если нет предыдущего сообщения - значит оно первое (показываем имя) или
	 * Если есть следующее сообщение и авторы текущего и предыдущего сообщений разные - значит оно первое (показываем имя)
	 */
	if (!prevMessage || (prevMessage && prevMessage.userId !== message.userId)) {
		isFirst = true;
	}

	/**
	 * Если нет последующего сообщения - значит оно последнее (показываем имя) или
	 * Если есть следующее сообщение и авторы текущего и предыдущего сообщений разные - значит оно первое (показываем имя)
	 */
	if (!postMessage || (postMessage && postMessage.userId !== message.userId)) {
		isLast = true;
	}

	return { isFirst, isLast };
};

// Получение всех остальных пользователей чата
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getLeftChatUsers = (usersInChat: any[], userId: string) => {
	logger.debug(`getLeftChatUsers [usersInChat.length=${usersInChat.length}, userId=${userId}]`);
	return usersInChat.filter((userInChat) => userInChat.id !== userId);
};
