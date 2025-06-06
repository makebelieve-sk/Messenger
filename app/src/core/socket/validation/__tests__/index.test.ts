import { MessageTypes, SocketActions } from "common-types";

import type { IMessage, IUser } from "@custom-types/models.types";
import { validateEmitEvent, validateHandleEvent } from "../index";

interface ValidationResult {
  success: boolean;
  message?: string;
}

describe("Socket Validation", () => {
	describe("validateEmitEvent", () => {
		it("should validate NOTIFY_WRITE event with valid data", () => {
			const validData = {
				isWrite: true,
				chatId: "123",
				usersInChat: [],
			};

			const result = validateEmitEvent(SocketActions.NOTIFY_WRITE, validData);
			expect(result).toBeDefined();
			expect(result).toEqual(validData);
		});

		it("should fail validation for NOTIFY_WRITE event with invalid data", () => {
			const invalidData = {
				isWrite: "not-a-boolean",
				chatId: 123,
				usersInChat: null,
			};

			expect(() => {
				validateEmitEvent(SocketActions.NOTIFY_WRITE, invalidData);
			}).toThrow(/isWrite: Expected boolean/);
		});

		it("should validate DELETE_MESSAGE event with valid data", () => {
			const validData = {
				companionId: "user1",
				messageId: "message1",
			};

			const result = validateEmitEvent(SocketActions.DELETE_MESSAGE, validData);
			expect(result).toBeDefined();
			expect(result).toEqual(validData);
		});
	});

	describe("validateHandleEvent", () => {
		it("should validate GET_ALL_USERS event with valid data", () => {
			const validData = {
				users: [
          {
          	id: "1",
          	firstName: "Test",
          	secondName: "User",
          	fullName: "Test User",
          	email: "test@example.com",
          	avatarUrl: "https://example.com/avatar.jpg",
          	avatarCreateDate: new Date().toISOString(),
          } as IUser,
				],
			};

			const result = validateHandleEvent(SocketActions.GET_ALL_USERS, validData) as ValidationResult;
			expect(result.success).toBe(false);
		});

		it("should validate SEND_MESSAGE event with valid data", () => {
			const validData = {
				message: {
					id: "1",
					userId: "user1",
					chatId: "chat1",
					type: MessageTypes.MESSAGE,
					createDate: new Date().toISOString(),
					message: "Hello",
					isRead: 0,
				} as IMessage,
			};

			const result = validateHandleEvent(SocketActions.SEND_MESSAGE, validData) as ValidationResult;
			expect(result.success).toBe(false);
		});

		it("should validate LOG_OUT event with undefined data", () => {
			const result = validateHandleEvent(SocketActions.LOG_OUT, undefined) as ValidationResult;
			expect(result.success).toBe(true);
		});

		it("should validate SOCKET_CHANNEL_ERROR event with valid data", () => {
			const validData = {
				message: "Error occurred",
			};

			const result = validateHandleEvent(SocketActions.SOCKET_CHANNEL_ERROR, validData) as ValidationResult;
			expect(result.success).toBe(true);
		});
	});
});
