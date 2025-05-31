import { authPath } from "./paths/authPath";
import { imagesPaths } from "./paths/imagesPaths ";
import { userPaths } from "./paths/userPaths";
import { authSchemas } from "./schemas/authSchemas";
import { imagesSchemas } from "./schemas/imagesSchemas ";
import { userSchemas } from "./schemas/userSchemas";

const swaggerConfig = {
	openapi: "3.0.0",
	info: {
		title: "My API",
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
			url: "https://localhost:8008",
		},
	],
	externalDocs: {
		description: "Find out more about Swagger",
		url: "http://swagger.io",
	},
};

export default swaggerConfig;