import { SocketActions } from "common-types";

import { getBaseUrl } from "@utils/swagger";

import { authPath } from "./swagger/paths/authPath";
import { friendsPaths } from "./swagger/paths/friendsPath";
import { imagesPaths } from "./swagger/paths/imagesPaths ";
import { userPaths } from "./swagger/paths/userPaths";
import authSchemas from "./swagger/schemas/authSchemas";
import friendsSchemas from "./swagger/schemas/friendsSchemas";
import imagesSchemas from "./swagger/schemas/imagesSchemas ";
import userSchemas from "./swagger/schemas/userSchemas";

const baseUrl = getBaseUrl();

const swaggerConfig = {
	openapi: "3.0.0",
	info: {
		title: "API backend Messenger",
		version: "1.0.0",
	},
	paths: {
		...userPaths,
		...authPath,
		...imagesPaths,
		...friendsPaths,
	},

	components: {
		securitySchemes: {
			cookieAuth: {
				type: "apiKey",
				in: "cookie",
				name: "connect.sid",
			},
		},
		schemas: {
			...userSchemas,
			...authSchemas,
			...imagesSchemas,
			...friendsSchemas,
			SocketEvent: {
				type: "object",
				properties: {
					event: {
						type: "string",
						enum: Object.values(SocketActions),
						example: "FOLLOW_FRIEND",
					},
					payload: {
						type: "object",
						additionalProperties: true,
					},
				},
			},
		},
	},
	security: [
		{
			cookieAuth: [],
		},
	],
	tags: [
		{
			name: "User",
		},
	],
	servers: [
		{
			url: baseUrl,
		},
	],
	externalDocs: {
		description: "ДИАГРАММА ПОСЛЕДОВАТЕЛЬНОСТЕЙ",
		url: `${baseUrl}/api-docs/diagram/#`,
	},
};

export default swaggerConfig;