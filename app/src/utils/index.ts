import i18next from "@service/i18n";
import Logger from "@service/Logger";
import useAuthStore from "@store/auth";
import useUIStore from "@store/ui";
import { Pages } from "@custom-types/enums";
import { type IUser } from "@custom-types/models.types";

const logger = Logger.init("utils");

// Склонение переданного массива строк по переданому числу
export const muchSelected = (number: number, txt: string[]) => {
	const cases = [ 2, 0, 1, 1, 1, 2 ];

	return txt[(number % 100 > 4 && number % 100 < 20)
		? 2
		: cases[(number % 10 < 5) ? number % 10 : 5]];
};

// Получить полное имя пользователя (Имя + Фамилия)
export const getFullName = (user: IUser) => {
	logger.debug(`getFullName [firstName=${user?.firstName}, thirdName=${user?.thirdName}]`);
	return user ? user.firstName + " " + user.thirdName : "";
};

// Установка фокуса HTML элементу в самый конец
export const setFocusOnEndNodeElement = (node: HTMLElement, pos = node.childNodes.length) => {
	logger.debug(`setFocusOnEndNodeElement [pos=${pos}]`);

	const range = document.createRange();
	const selection = window.getSelection() as Selection;
	range.setStart(node, pos);
	range.collapse(true);
	selection.removeAllRanges();
	selection.addRange(range);
};

// Переход на страницу другого пользователя
export const goToAnotherProfile = (url: Pages, userId?: string) => {
	// encodeURIComponent необходим, чтобы в URL не было спецсимволов (мало ли в userId что-то подобное есть)
	return userId ? `${url}/${encodeURIComponent(userId)}` : url;
};

// Ждем публичного ключа
export async function waitForPublicKeyCookie(): Promise<string | null> {
	for (let i = 0; i < 100; i++) {
		const cookie = document.cookie.match(/(^|;) ?publicKey=([^;]*)(;|$)/);
		if (cookie?.[2]) return decodeURIComponent(cookie[2]);
		await new Promise((r) => setTimeout(r, 100)); // 100мс
	}
	return null;
}

//Преобразует PEM-строку публичного ключа в ArrayBuffer
function pemToArrayBuffer(pem: string): ArrayBuffer {
	const b64 = pem
		.replace(/-----BEGIN PUBLIC KEY-----/, "")
		.replace(/-----END PUBLIC KEY-----/, "")
		.replace(/\s+/g, "");
	const binary = atob(b64);
	const buffer = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		buffer[i] = binary.charCodeAt(i);
	}
	return buffer.buffer;
}

//Импортирует публичный ключ в формате PEM в WebCrypto ключ
async function importPublicKey(pem: string): Promise<CryptoKey> {
	const keyData = pemToArrayBuffer(pem);
	return await window.crypto.subtle.importKey(
		"spki",
		keyData,
		{
			name: "RSA-OAEP",
			hash: "SHA-256",
		},
		false,
		[ "encrypt" ],
	);
}

//Метод для шифрования, возвращает base64 строку
export async function _encrypt(data: object): Promise<string | null> {
	const publicKeyPem = useAuthStore.getState().publicKey;
	if (!publicKeyPem) {
		useUIStore.getState().setError(i18next.t("utils.no_public_key_error"));
		return null;
	}

	let cryptoKey: CryptoKey;
	try {
		cryptoKey = await importPublicKey(publicKeyPem);
	} catch {
		useUIStore.getState().setError(i18next.t("utils.import_key_error"));
		return null;
	}

	const json = JSON.stringify(data);
	const encoded = new TextEncoder().encode(json);

	let cipherBuffer: ArrayBuffer;
	try {
		cipherBuffer = await window.crypto.subtle.encrypt(
			{
				name: "RSA-OAEP",
			},
			cryptoKey,
			encoded,
		);
	} catch {
		useUIStore.getState().setError(i18next.t("utils.encrypt_error"));
		return null;
	}

	const uint8 = new Uint8Array(cipherBuffer);
	const b64 = btoa(String.fromCharCode(...uint8));
	return b64;
}