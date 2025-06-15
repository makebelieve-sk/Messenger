import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
	NotificationQueueDto,
	PayloadNotificationDto,
} from "src/dto/rabbitmq.dto";
import RabbitMQNotificationValidationPipe from "src/pipes/rabbitmq-notification.pipe";
import { NOTIFICATION_TYPE, STRATEGY_ACTION } from "src/types/enums";
import { BadRequestException } from "@nestjs/common";

import "reflect-metadata";

// Mock class-validator and class-transformer
jest.mock("class-validator", () => ({
	validate: jest.fn(),
	IsString: () => jest.fn(),
	IsNotEmpty: () => jest.fn(),
	IsEnum: () => jest.fn(),
}));

jest.mock("class-transformer", () => ({
	plainToInstance: jest.fn(),
}));

describe("RabbitMQNotificationValidationPipe", () => {
	let pipe: RabbitMQNotificationValidationPipe;
	const mockDtoClass = NotificationQueueDto;

	beforeEach(() => {
		pipe = new RabbitMQNotificationValidationPipe(mockDtoClass);
		jest.clearAllMocks();
	});

	describe("transform", () => {
		const validPayload: PayloadNotificationDto = {
			userName: "John Doe",
			avatarUrl: "https://example.com/avatar.jpg",
			title: "Test Notification",
			mainText: "This is a test notification",
			text: "Additional information",
		};

		const validData: NotificationQueueDto = {
			type: NOTIFICATION_TYPE.EMAIL,
			recipient: "user123",
			payload: validPayload,
			action: STRATEGY_ACTION.NEW_NOTIFICATION,
		};

		it("should successfully validate and return DTO instance", async () => {
			// Arrange
			const mockDtoInstance = { ...validData };

			(plainToInstance as jest.Mock).mockReturnValue(mockDtoInstance);
			(validate as jest.Mock).mockResolvedValue([]);

			// Act
			const result = await pipe.transform(validData);

			// Assert
			expect(plainToInstance).toHaveBeenCalledWith(mockDtoClass, validData);
			expect(validate).toHaveBeenCalledWith(mockDtoInstance, {
				whitelist: true,
				forbidNonWhitelisted: true,
			});
			expect(result).toBe(mockDtoInstance);
		});

		it("should throw BadRequestException when validation fails", async () => {
			// Arrange
			const invalidData = {
				...validData,
				type: "INVALID_TYPE" as NOTIFICATION_TYPE,
			};
			const mockDtoInstance = { ...invalidData };
			const validationErrors = [
				{
					constraints: {
						isEnum: "type must be a valid enum value",
						isNotEmpty: "type should not be empty",
					},
				},
			];

			(plainToInstance as jest.Mock).mockReturnValue(mockDtoInstance);
			(validate as jest.Mock).mockResolvedValue(validationErrors);

			// Act & Assert
			await expect(pipe.transform(invalidData)).rejects.toThrow(
				BadRequestException,
			);
			await expect(pipe.transform(invalidData)).rejects.toThrow(
				"Validation failed: type must be a valid enum value; type should not be empty",
			);
		});

		it("should handle empty validation errors array", async () => {
			// Arrange
			const mockDtoInstance = { ...validData };

			(plainToInstance as jest.Mock).mockReturnValue(mockDtoInstance);
			(validate as jest.Mock).mockResolvedValue([]);

			// Act
			const result = await pipe.transform(validData);

			// Assert
			expect(result).toBe(mockDtoInstance);
		});

		it("should handle validation errors without constraints", async () => {
			// Arrange
			const invalidData = {
				...validData,
				payload: {
					userName: "",
					avatarUrl: "",
					title: "",
					mainText: "",
				},
			};
			const mockDtoInstance = { ...invalidData };
			const validationErrors = [
				{
					constraints: {},
				},
			];

			(plainToInstance as jest.Mock).mockReturnValue(mockDtoInstance);
			(validate as jest.Mock).mockResolvedValue(validationErrors);

			// Act & Assert
			await expect(pipe.transform(invalidData)).rejects.toThrow(
				BadRequestException,
			);
			await expect(pipe.transform(invalidData)).rejects.toThrow(
				"Validation failed: ",
			);
		});
	});
});
