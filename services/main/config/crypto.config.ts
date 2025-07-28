import { RSAKeyPairOptions } from "crypto";

// Конфигурация для гененрации ключей
export const cryptoConfig: RSAKeyPairOptions<"pem", "pem"> = {
	modulusLength: 4096,
	publicKeyEncoding: {
		type: "spki",
		format: "pem",
	},
	privateKeyEncoding: {
		type: "pkcs8",
		format: "pem",
	},
};

export function getPrivateKeyPem(privateKey: string): string {
	return privateKey
		.replace(/\\n/g, "\n")
		.replace(/^"|"$/g, "");
}


// Конфигурация для расшифровки приватного ключа
export function getPrivateKeyConfig(privateKey: string): { key: string; format: "pem"; type: "pkcs8" } {
	return {
		key: getPrivateKeyPem(privateKey),
		format: "pem",
		type: "pkcs8",
	};
}
