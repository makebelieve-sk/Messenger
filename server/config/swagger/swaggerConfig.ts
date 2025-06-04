import { getBaseUrl } from "@utils/swagger";

import { authPath } from "./paths/authPath";
import { imagesPaths } from "./paths/imagesPaths ";
import { userPaths } from "./paths/userPaths";
import { authSchemas } from "./schemas/authSchemas";
import { imagesSchemas } from "./schemas/imagesSchemas ";
import { userSchemas } from "./schemas/userSchemas";

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