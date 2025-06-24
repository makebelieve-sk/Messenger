import { I18nService } from "nestjs-i18n";
import { type Transporter } from "nodemailer";
import { NodemailerConfig } from "src/configs/nodemailer.config";
import ConfigError from "src/errors/config.error";
import FileLogger from "src/services/logger.service";
import { CONFIG_TYPE, INJECTION_KEYS } from "src/types/enums";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// Сервис для генерации транспорта отправки письма на почту
@Injectable()
export default class NodemailerService {
	private fromName: string;
	private fromEmail: string;

	constructor(
		@Inject(INJECTION_KEYS.NODEMAILER_SERVER)
		private readonly transporter: Transporter,
		private readonly logger: FileLogger,
		private readonly configService: ConfigService,
		private readonly i18n: I18nService,
	) {
		this.logger.setContext(NodemailerService.name);

		const nodemailerConfig: NodemailerConfig | undefined = this.configService.get(
			CONFIG_TYPE.NODEMAILER,
		);

		if (!nodemailerConfig) {
			throw new ConfigError(this.i18n.t("nodemailer.config_error"));
		}

		this.fromName = nodemailerConfig.from.name;
		this.fromEmail = nodemailerConfig.from.email;
	}

	get supportMail() {
		return this.fromEmail;
	}

	private get fromTitle() {
		return `"${this.fromName}" <${this.fromEmail}>`;
	}

	async sendMail(to: string, subject: string, html: string): Promise<void> {
		this.logger.debug(
			this.i18n.t("nodemailer.send-email", { args: { to, subject } }),
		);

		await this.transporter.sendMail({
			from: this.fromTitle,
			to,
			subject,
			html,
		});
	}
}
