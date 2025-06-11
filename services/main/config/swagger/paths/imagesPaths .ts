const imagesPaths = {
	"/upload-avatar": {
		post: {
			summary: "Загрузка аватара при регистрации",
			description: "⚠️ Используется только при регистрации. Возвращает пути к обработанным изображениям.",
			consumes: [ "multipart/form-data" ],
			requestBody: {
				content: {
					"multipart/form-data": {
						schema: {
							type: "object",
							properties: {
								avatar: {
									type: "string",
									format: "binary",
									description: "Файл аватара (JPG/PNG)",
								},
							},
							required: [ "avatar" ],
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Изображения успешно обработаны",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									success: { type: "boolean", example: true },
									newAvatar: { $ref: "#/components/schemas/ProcessedAvatar" },
									newPhoto: { $ref: "#/components/schemas/ProcessedPhoto" },
								},
							},
						},
					},
				},
				"400": {
					description: "Ошибка обработки изображения",
				},
			},
		},
	},
	"/change-avatar": {
		post: {
			summary: "Смена аватара пользователя",
			description: "Заменяет текущий аватар. Требует аутентификации.",
			security: [ { cookieAuth: [] } ],
			consumes: [ "multipart/form-data" ],
			requestBody: {
				content: {
					"multipart/form-data": {
						schema: {
							type: "object",
							properties: {
								avatar: {
									type: "string",
									format: "binary",
									description: "Новый файл аватара",
								},
							},
							required: [ "avatar" ],
						},
					},
				},
			},
			responses: {
				"201": {
					description: "Аватар успешно изменен",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ChangeAvatarResponse",
							},
						},
					},
				},
				"401": {
					description: "Пользователь не авторизован",
				},
				"404": {
					description: "Пользователь не найден",
				},
			},
		},
	},
	"/get-photos": {
		post: {
			summary: "Получение фотографий пользователя",
			description: "Возвращает фотографии профиля с пагинацией.",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								userId: {
									type: "string",
									format: "uuid",
									example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8",
								},
								limit: {
									type: "integer",
									example: 10,
									description: "Количество фотографий на странице",
								},
								offset: {
									type: "integer",
									example: 0,
									description: "Смещение пагинации",
								},
							},
							required: [ "userId" ],
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Список фотографий",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/PhotosResponse",
							},
						},
					},
				},
			},
		},
	},
	"/save-photos": {
		post: {
			summary: "Сохранение фотографий в профиль",
			description: "Загружает одну или несколько фотографий. Требует аутентификации.",
			security: [ { cookieAuth: [] } ],
			consumes: [ "multipart/form-data" ],
			requestBody: {
				content: {
					"multipart/form-data": {
						schema: {
							type: "object",
							properties: {
								photo: {
									type: "array",
									items: {
										type: "string",
										format: "binary",
									},
									description: "Фотографии для загрузки (макс. 5)",
								},
							},
						},
					},
				},
			},
			responses: {
				"201": {
					description: "Фотографии успешно сохранены",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/SavePhotosResponse",
							},
						},
					},
				},
			},
		},
	},
	"/delete-photo": {
		post: {
			summary: "Удаление фотографии",
			description: "Удаляет фото из профиля или аватар. Требует аутентификации.",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								imageUrl: {
									type: "string",
									example: "/uploads/avatars/avatar-123.jpg",
									description: "Путь к изображению",
								},
								isAvatar: {
									type: "boolean",
									example: false,
									description: "Флаг указывающий, является ли изображение аватаром",
								},
							},
							required: [ "imageUrl" ],
						},
					},
				},
			},
			responses: {
				"204": {
					description: "Фотография успешно удалена",
				},
				"404": {
					description: "Фотография не найдена",
				},
			},
		},
	},
};

export default imagesPaths;