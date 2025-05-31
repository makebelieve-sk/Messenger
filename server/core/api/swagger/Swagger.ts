import swaggerUi from "swagger-ui-express";

import swaggerConfig from "@config/swagger/swaggerConfig";

export default class swaggerWork {
	readonly serve = swaggerUi.serve;
	readonly setup = swaggerUi.setup(swaggerConfig);
	constructor() { }
}