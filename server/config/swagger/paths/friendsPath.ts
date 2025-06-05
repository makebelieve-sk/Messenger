export const friendsPaths = {
	"/friends/notification": {
		get: {
			summary: "Получить количество новых заявок в друзья",
			description: "Возвращает количество непрочитанных заявок для отображения в меню",
			security: [ { cookieAuth: [] } ],
			responses: {
				"200": {
					description: "Успешный запрос",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									success: { type: "boolean", example: true },
									friendsNotification: { 
										type: "number", 
										example: 3,
										description: "Количество новых заявок",
									},
								},
							},
						},
					},
				},
			},
		},
	},
	"/friends/all-counts": {
		post: {
			summary: "Получить общее количество друзей",
			description: "Возвращает количество друзей, подписчиков и запросов для пользователя",
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
									description: "ID пользователя (опционально, по умолчанию текущий)",
								},
							},
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Успешный запрос",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/FriendsCounts",
							},
						},
					},
				},
			},
		},
	},
	"/friends/possible": {
		post: {
			summary: "Получить возможных друзей",
			description: "Возвращает список пользователей, которых можно добавить в друзья",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/PaginationWithSearch",
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Список возможных друзей",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/PaginatedFriends",
							},
						},
					},
				},
			},
		},
	},
	"/friends/my": {
		post: {
			summary: "Получить список друзей",
			description: "Возвращает список друзей пользователя",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/FriendsData",
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Список друзей",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/PaginatedFriends",
							},
						},
					},
				},
			},
		},
	},
	"/friends/online": {
		post: {
			summary: "Проверить онлайн статус",
			description: "Проверяет онлайн статус пользователей",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								ids: {
									type: "array",
									items: { type: "string", format: "uuid" },
									example: [ "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8", "3F2504E0-4F89-11D3-9A0C-0305E82C3301" ],
								},
								search: { 
									type: "string", 
									example: "Иван", 
								},
							},
							required: [ "ids" ],
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Статусы онлайн",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									success: { type: "boolean", example: true },
									online: {
										type: "array",
										items: {
											$ref: "#/components/schemas/OnlineStatus",
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
	"/friends/followers": {
		post: {
			summary: "Получить подписчиков",
			description: "Возвращает список подписчиков пользователя",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/FriendsData",
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Список подписчиков",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/PaginatedFriends",
							},
						},
					},
				},
			},
		},
	},
	"/friends/blocked": {
		post: {
			summary: "Получить заблокированных",
			description: "Возвращает список заблокированных пользователей",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/FriendsData",
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Список заблокированных",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/PaginatedFriends",
							},
						},
					},
				},
			},
		},
	},
	"/friends/common": {
		post: {
			summary: "Получить общих друзей",
			description: "Возвращает общих друзей с другим пользователем",
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
								},
								lastCreatedAt: { 
									type: "string", 
									format: "date-time",
									example: "2025-05-28T14:30:00Z", 
								},
								search: { 
									type: "string", 
									example: "Иван", 
								},
							},
							required: [ "userId", "limit" ],
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Список общих друзей",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/PaginatedFriends",
							},
						},
					},
				},
			},
		},
	},
	"/friends/incoming-requests": {
		post: {
			summary: "Получить входящие запросы",
			description: "Возвращает входящие запросы в друзья",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/FriendsData",
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Список запросов",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/PaginatedFriends",
							},
						},
					},
				},
			},
		},
	},
	"/friends/outgoing-requests": {
		post: {
			summary: "Получить исходящие запросы",
			description: "Возвращает отправленные запросы в друзья",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/FriendsData",
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Список запросов",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/PaginatedFriends",
							},
						},
					},
				},
			},
		},
	},
	"/friends/follow": {
		post: {
			summary: "Подписаться на пользователя",
			description: "Отправляет запрос на дружбу",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								friendId: { 
									type: "string", 
									format: "uuid",
									example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8", 
								},
							},
							required: [ "friendId" ],
						},
					},
				},
			},
			responses: {
				"201": {
					description: "Запрос отправлен",
				},
			},
		},
	},
	"/friends/unfollow": {
		post: {
			summary: "Отписаться от пользователя",
			description: "Отменяет запрос на дружбу",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								friendId: { 
									type: "string", 
									format: "uuid",
									example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8", 
								},
							},
							required: [ "friendId" ],
						},
					},
				},
			},
			responses: {
				"204": {
					description: "Подписка отменена",
				},
			},
		},
	},
	"/friends/add": {
		post: {
			summary: "Добавить в друзья",
			description: "Принимает запрос от подписчика",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								friendId: { 
									type: "string", 
									format: "uuid",
									example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8", 
								},
							},
							required: [ "friendId" ],
						},
					},
				},
			},
			responses: {
				"201": {
					description: "Друг добавлен",
				},
			},
		},
	},
	"/friends/accept-request": {
		post: {
			summary: "Принять запрос дружбы",
			description: "Принимает входящий запрос",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								friendId: { 
									type: "string", 
									format: "uuid",
									example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8", 
								},
							},
							required: [ "friendId" ],
						},
					},
				},
			},
			responses: {
				"204": {
					description: "Запрос принят",
				},
			},
		},
	},
	"/friends/left-followers": {
		post: {
			summary: "Оставить в подписчиках",
			description: "Отклоняет запрос, оставляя в подписчиках",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								friendId: { 
									type: "string", 
									format: "uuid",
									example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8", 
								},
							},
							required: [ "friendId" ],
						},
					},
				},
			},
			responses: {
				"204": {
					description: "Пользователь оставлен в подписчиках",
				},
			},
		},
	},
	"/friends/delete": {
		post: {
			summary: "Удалить из друзей",
			description: "Удаляет пользователя из друзей",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								friendId: { 
									type: "string", 
									format: "uuid",
									example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8", 
								},
							},
							required: [ "friendId" ],
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Друг удален",
				},
			},
		},
	},
	"/friends/block": {
		post: {
			summary: "Заблокировать пользователя",
			description: "Добавляет пользователя в чёрный список",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								friendId: { 
									type: "string", 
									format: "uuid",
									example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8", 
								},
							},
							required: [ "friendId" ],
						},
					},
				},
			},
			responses: {
				"204": {
					description: "Пользователь заблокирован",
				},
			},
		},
	},
	"/friends/unblock": {
		post: {
			summary: "Разблокировать пользователя",
			description: "Убирает пользователя из чёрного списка",
			security: [ { cookieAuth: [] } ],
			requestBody: {
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								friendId: { 
									type: "string", 
									format: "uuid",
									example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8", 
								},
							},
							required: [ "friendId" ],
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Пользователь разблокирован",
				},
			},
		},
	},
};