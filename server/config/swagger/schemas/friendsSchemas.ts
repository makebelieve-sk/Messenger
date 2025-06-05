export const friendsSchemas = {
	// Основная схема для параметров запроса
	FriendsData: {
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
		required: [ "limit" ],
	},

	// Схема для пагинации и поиска
	PaginationWithSearch: {
		type: "object",
		properties: {
			limit: { 
				type: "integer", 
				example: 10,
				description: "Количество элементов на странице", 
			},
			page: { 
				type: "integer", 
				example: 0,
				description: "Номер страницы (начиная с 0)", 
			},
			lastCreatedAt: { 
				type: "string", 
				format: "date-time",
				nullable: true,
				example: "2025-05-28T14:30:00Z",
				description: "Дата последнего элемента для курсорной пагинации", 
			},
			search: { 
				type: "string", 
				example: "Иван",
				description: "Строка для поиска по имени", 
			},
		},
		required: [ "limit" ],
	},

	// Схема для ответа со списком друзей
	PaginatedFriends: {
		type: "object",
		properties: {
			success: { type: "boolean", example: true },
			friends: {
				type: "array",
				items: {
					$ref: "#/components/schemas/Friend",
				},
			},
			totalCount: { 
				type: "integer", 
				example: 100,
				description: "Общее количество элементов", 
			},
		},
	},

	// Схема описания друга
	Friend: {
		type: "object",
		properties: {
			id: { type: "string", format: "uuid" },
			firstName: { type: "string", example: "Иван" },
			thirdName: { type: "string", example: "Иванов" },
			avatarUrl: { 
				type: "string", 
				nullable: true,
				example: "/uploads/avatars/avatar.jpg", 
			},
			online: { 
				type: "boolean", 
				example: true,
				description: "Статус онлайн", 
			},
			createdAt: { 
				type: "string", 
				format: "date-time",
				description: "Дата добавления/подписки", 
			},
		},
	},

	// Схема для счетчиков
	FriendsCounts: {
		type: "object",
		properties: {
			success: { type: "boolean", example: true },
			friendsCount: { 
				type: "integer", 
				example: 42,
				description: "Количество друзей", 
			},
			followersCount: { 
				type: "integer", 
				example: 15,
				description: "Количество подписчиков", 
			},
			incomingRequestsCount: { 
				type: "integer", 
				example: 3,
				description: "Количество входящих запросов", 
			},
			outgoingRequestsCount: { 
				type: "integer", 
				example: 2,
				description: "Количество исходящих запросов", 
			},
		},
	},

	// Схема для блокировки
	BlockStatus: {
		type: "object",
		properties: {
			isBlockedByMe: { 
				type: "boolean", 
				example: false,
				description: "Заблокировал ли текущий пользователь", 
			},
			meIsBlocked: { 
				type: "boolean", 
				example: true,
				description: "Заблокирован ли текущий пользователь", 
			},
		},
	},
	// Схема для статуса онлайн
	OnlineStatus: {
		type: "object",
		properties: {
			id: { type: "string", format: "uuid", example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8" },
			online: { type: "boolean", example: true },
		},
	},
};