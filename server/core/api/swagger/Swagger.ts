import { HTTPStatuses } from "common-types";
import fs from "fs/promises";
import path from "path";
import swaggerUi from "swagger-ui-express";

import swaggerConfig from "@config/swagger.config";
import { t } from "@service/i18n";
import { MainError } from "@errors/controllers";

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
			return `sequenceDiagram\n  Note over ${t("diagram.client")}: Endpoint ${swaggerPath} ${t("diagram.not_found")}`;
		}

		const op = pathObj[method];

		let diagram = `sequenceDiagram\n  participant ${t("diagram.client")}\n  participant ${t("diagram.server")}`;

		diagram += `\n ${t("diagram.client")} ->> ${t("diagram.server")}: ${method.toUpperCase()} ${swaggerPath}`;

		const responses: { [code: string]: Response } = op.responses || {};

		for (const [ code, res ] of Object.entries(responses)) {
			const desc = typeof res === "string" ? res : res.description ?? "";
			diagram += `\n  ${t("diagram.server")} -->>${t("diagram.client")}: ${code} ${desc}`;
		}

		return diagram;
	}

	async generateDiagramPage(): Promise<string> {
		const filePath = path.join(__dirname, "../../../public/diagram.html");
		try {
			await fs.access(filePath);
		} catch {
			throw new MainError(
				t("main.error.diagram_file_not_found"),
				HTTPStatuses.NotFound,
			);
		}

		let html = await fs.readFile(filePath, "utf-8");

		const endpoints = Object.entries(swaggerConfig.paths)
			.map(([ path, methods ]) => {
				const ops = Object.keys(methods).map(
					(method) => `<li><a href="#" onclick="renderDiagram('${method}', '${path}')">${method.toUpperCase()} ${path}</a></li>`,
				).join("\n");
				return ops;
			}).join("\n");

		html = html.replace("{{endpoints}}", endpoints);

		return html;
	}
}