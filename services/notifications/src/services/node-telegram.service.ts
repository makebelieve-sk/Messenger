import { I18nService } from "nestjs-i18n";
import TelegramBot, {
	type ChatId,
	type SendMessageOptions,
} from "node-telegram-bot-api";
import { NodeTelegramConfig } from "src/configs/telegram.config";
import ConfigError from "src/errors/config.error";
import StrategyError from "src/errors/strategy.error";
import FileLogger from "src/services/logger.service";
import TelegramUsersService from "src/services/tables/telegram-users.service";
import UsersService from "src/services/tables/users.service";
import { CONFIG_TYPE, INJECTION_KEYS } from "src/types/enums";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// Сервис для управления ботом в телеграме
@Injectable()
export default class NodeTelegramService implements OnModuleInit {
	constructor(
		@Inject(INJECTION_KEYS.NODE_TELEGRAM)
		private readonly bot: TelegramBot,
		private readonly logger: FileLogger,
		private readonly i18n: I18nService,
		private readonly configService: ConfigService,
		private readonly telegramUsersService: TelegramUsersService,
		private readonly usersService: UsersService,
	) {
		this.logger.setContext(NodeTelegramService.name);
	}

	private get channelName() {
		const nodeTelegramConfig: NodeTelegramConfig | undefined =
			this.configService.get(CONFIG_TYPE.NODE_TELEGRAM);

		if (!nodeTelegramConfig) {
			throw new ConfigError(this.i18n.t("telegram.config_error"));
		}

		return nodeTelegramConfig.channelName;
	}

	onModuleInit() {
		// После инициализации модуля необходимо зарегистрировать слушатели сообщений у бота
		this.registerHandlers();
	}

	// Отправляет сообщение в указанный чат или канал (на данный момент удален, при необходимости можно восстановить)
	async notifyChannel(text: string) {
		try {
			this.logger.debug(
				this.i18n.t("telegram.channel_message_sent", { args: { text } }),
			);

			await this.bot.sendMessage(this.channelName, text, {
				parse_mode: "Markdown",
			});
		} catch (error) {
			this.logger.error(this.i18n.t("telegram.channel_error"), error);
			throw new StrategyError(
				this.i18n.t("telegram.send_error", { args: { error } }),
			);
		}
	}

	// Отправка сообщения пользователю
	async notifyUser(
		userChatId: ChatId,
		message: string,
		options?: SendMessageOptions,
	) {
		try {
			this.logger.debug(
				this.i18n.t("telegram.private_message_sent", {
					args: { userChatId, message },
				}),
			);

			await this.bot.sendMessage(userChatId, message, options);
		} catch (error) {
			this.logger.error(this.i18n.t("telegram.private_message_error"), error);
			throw new StrategyError(
				this.i18n.t("telegram.send_error", { args: { error } }),
			);
		}
	}

	// Подписка на сообщения пользователя
	private registerHandlers() {
		this.bot.on("message", async (message) => {
			const chatId = message.chat.id;
			const text = message.text;

			// Самое начало общения
			if (text === "/start") {
				// Заменяем пользователю клавиатуру на кнопки
				const opts = {
					reply_markup: {
						keyboard: [
							[{ text: this.i18n.t("telegram.share_phone"), request_contact: true }],
						],
						one_time_keyboard: true,
						resize_keyboard: true,
					},
				};

				await this.notifyUser(
					chatId,
					this.i18n.t("telegram.share_phone_message"),
					opts,
				);
			}
		});

		// Обрабатываем полученный контакт
		this.bot.on("contact", async (message) => {
			if (message.contact && message.from) {
				const chatId = message.chat.id;
				const phone = message.contact.phone_number;
				const userId = message.from.id;
				const { first_name, last_name = "", username = "" } = message.from;

				this.logger.log(
					this.i18n.t("telegram.contact_shared", {
						args: { username: username || userId, phone },
					}),
				);

				try {
					// Ищем пользователя по указанному номеру телефона
					const foundUser = await this.usersService.findOneBy({ phone });

					// Сохраняем запись с полной информацией об этом пользователе
					await this.telegramUsersService.create({
						firstName: first_name,
						lastName: last_name,
						userName: username,
						telegramId: chatId,
						userId: foundUser.id,
					});
				} catch (error) {
					this.logger.warn(this.i18n.t("telegram.contact_error") + error);

					await this.notifyUser(chatId, this.i18n.t("telegram.contact_error"), {
						parse_mode: "Markdown",
					});

					return;
				}

				await this.notifyUser(chatId, this.i18n.t("telegram.thanks_for_sharing"), {
					parse_mode: "Markdown",
				});
			}
		});
	}
}
