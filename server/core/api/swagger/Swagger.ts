import swaggerUi from "swagger-ui-express";

import swaggerConfig from "@config/swagger/swaggerConfig";

interface Response {
	description: string;
}

export default class SwaggerWork {
	private readonly _serve = swaggerUi.serve;
	private readonly _setup = swaggerUi.setup(swaggerConfig);
	constructor() { }

	get serve() {
		return this._serve;
	}
	get setup() {
		return this._setup;
	}
	generateMermaidDiagram(endpoint: string, method: string = "post") {
		const swaggerPath = endpoint.replaceAll("_", "/");
		const pathObj = swaggerConfig.paths[swaggerPath];

		if (!pathObj || !pathObj[method]) {
			return `sequenceDiagram\n  Note over Клиент: Endpoint ${swaggerPath} не найден`;
		}

		const op = pathObj[method];

		let diagram = "sequenceDiagram\n  participant Клиент\n  participant Сервер";

		diagram += `\n  Клиент->>Сервер: ${method.toUpperCase()} ${swaggerPath}`;

		const responses: { [code: string]: Response } = op.responses || {};

		for (const [ code, res ] of Object.entries(responses)) {
			const desc = typeof res === "string" ? res : res.description ?? "";
			diagram += `\n  Сервер-->>Клиент: ${code} ${desc}`;
		}

		return diagram;
	}
}