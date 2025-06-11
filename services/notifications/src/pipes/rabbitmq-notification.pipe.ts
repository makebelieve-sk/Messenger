import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { NotificationQueueDto } from "src/dto/rabbitmq.dto";
import {
	BadRequestException,
	Injectable,
	PipeTransform,
	Type,
} from "@nestjs/common";

// Валидация полученного сообщения по очереди нотификаций
@Injectable()
export default class RabbitMQNotificationValidationPipe
	implements PipeTransform<NotificationQueueDto>
{
	constructor(private readonly dtoClass: Type<NotificationQueueDto>) {}

	async transform(value: NotificationQueueDto) {
		// Преобразуем «сырые» данные в экземпляр DTO
		const dto = plainToInstance(this.dtoClass, value);
		// Валидируем
		const errors = await validate(dto, {
			whitelist: true, // Отбросываем неописанные в DTO свойства
			forbidNonWhitelisted: true, // Если встречается поле, не объявленное в dto - выбросить ошибку
		});

		if (errors.length) {
			// Сформируем читаемый список ошибок
			const messages = errors
				.map((error) => Object.values(error.constraints || {}).join("; "))
				.join("; ");
			throw new BadRequestException(`Validation failed: ${messages}`);
		}

		// Возвращаем сам экземпляр DTO (а не голый объект)
		return dto;
	}
}
