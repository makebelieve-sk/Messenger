const imagesSchemas = {
	// Обработанное изображение
	ProcessedImage: {
		type: "object",
		properties: {
			path: {
				type: "string",
				example: "/uploads/avatars/avatar-123.jpg",
			},
			width: {
				type: "integer",
				example: 300,
			},
			height: {
				type: "integer",
				example: 300,
			},
			size: {
				type: "integer",
				example: 10240,
				description: "Размер файла в байтах",
			},
		},
	},

	// Обработанный аватар
	ProcessedAvatar: {
		type: "object",
		properties: {
			newAvatarUrl: {
				type: "string",
				example: "/uploads/avatars/avatar-123.jpg",
			},
		},
	},

	// Обработанная фотография
	ProcessedPhoto: {
		type: "object",
		properties: {
			newPhotoUrl: {
				type: "string",
				example: "/uploads/photos/photo-456.jpg",
			},
		},
	},

	// Ответ при смене аватара
	ChangeAvatarResponse: {
		type: "object",
		properties: {
			success: { type: "boolean", example: true },
			newAvatar: {
				type: "object",
				properties: {
					newAvatarUrl: { type: "string" },
					avatarCreationDate: {
						type: "string",
						format: "date-time",
						example: "2025-05-28T14:30:00Z",
					},
				},
			},
			newPhoto: {
				type: "object",
				properties: {
					id: {
						type: "string",
						format: "uuid",
						example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8",
					},
					newPhotoUrl: { type: "string" },
					photoCreationDate: {
						type: "string",
						format: "date-time",
					},
				},
			},
		},
	},

	// Ответ с фотографиями
	PhotosResponse: {
		type: "object",
		properties: {
			success: { type: "boolean", example: true },
			photos: {
				type: "array",
				items: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						path: { type: "string" },
						width: { type: "integer" },
						height: { type: "integer" },
						size: { type: "integer" },
						createdAt: { type: "string", format: "date-time" },
					},
				},
			},
			totalCount: {
				type: "integer",
				example: 15,
				description: "Общее количество фотографий",
			},
		},
	},

	// Ответ при сохранении фото
	SavePhotosResponse: {
		type: "object",
		properties: {
			success: { type: "boolean", example: true },
			photos: {
				type: "array",
				items: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						path: { type: "string" },
						createdAt: { type: "string", format: "date-time" },
					},
				},
			},
		},
	},
};

export default imagesSchemas;