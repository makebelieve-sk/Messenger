const userPaths = {
	"/get-me": {
		get: {
			summary: "Инфа о текущем юзере",
			responses: {
				"200": {
					description: "OK",
					content: {
						"application/json": {
							"schema": {
								type: "object",
								"properties": {
									"success": {
										type: "boolean",
										example: true,
									},
									"user": {
										$ref: "#/components/schemas/User",
									},
									"userDetails": {
										$ref: "#/components/schemas/UserDetails",
									},
								},
							},
						},
					},
				},
				"401": {
					description: "Unauthorized",
				},
			},
		},
	},
	"/get-user": {
		post: {
			summary: "Инфа о юзере",
			security: [
				{
					"cookieAuth": [],
				},
			],
			requestBody: {
				description: "ID пользователя",
				required: true,
				content: {
					"application/json": {
						"schema": {
							type: "object",
							"properties": {
								"id": {
									type: "string",
									example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8",
								},
							},
							"required": [ "id" ],
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Информация о пользователе",
					content: {
						"application/json": {
							"schema": {
								type: "object",
								"properties": {
									"success": {
										"type": "boolean",
										"example": true,
									},
									"user": {
										$ref: "#/components/schemas/User",
									},
									"userDetails": {
										$ref: "#/components/schemas/UserDetails",
									},
								},
							},
						},
					},
				},
				"400": {
					description: "Некорректный ID",
				},
				"401": {
					description: "Не авторизован",
				},
				"404": {
					description: "Пользователь не найден",
				},
			},
		},
	},

	"/edit-info": {
		put: {
			summary: "редачим информацию о юзере",
			security: [
				{
					"cookieAuth": [],
				},
			],
			requestBody: {
				description: "Информация о юзере",
				required: true,
				content: {
					"application/json": {
						"schema": {
							$ref: "#/components/schemas/UserEdit",
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Обновление данных о пользователе",
					content: {
						"application/json": {
							schema: {
								type: "object",
								"properties": {
									"success": {
										"type": "boolean",
										"example": true,
									},
									// "userEdit": {
									// 	$ref: "#/components/schemas/UserEdit"
									// }
									user: { $ref: "#/components/schemas/User" },
									userDetails: { $ref: "#/components/schemas/UserDetails" },
								},
							},
						},
					},
				},
				"400": {
					description: "Некорректный ID",
				},
				"401": {
					description: "Не авторизован",
				},
				"404": {
					description: "Пользователь не найден",
				},
			},
		},
	},
};

export default userPaths;