import { CONFIG_TYPE } from "src/types/enums";
import { registerAs } from "@nestjs/config";

export interface NodemailerConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
	from: {
		name: string;
		email: string;
	};
}

// Генерация конфига Nodemailer с env переменными
const nodemailerConfig = registerAs<NodemailerConfig>(
	CONFIG_TYPE.NODEMAILER,
	() => ({
		host: process.env.SMTP_HOST as string,
		port: parseInt(process.env.SMTP_PORT as string),
		secure: true,
		auth: {
			user: process.env.SMTP_USER as string,
			pass: process.env.SMTP_PASSWORD as string,
		},
		from: {
			name: process.env.SMTP_FROM_NAME as string,
			email: process.env.SMTP_FROM_EMAIL as string,
		},
	}),
);

export default nodemailerConfig;
