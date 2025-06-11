const authPath = {
	"/sign-up": {
		post: {
			summary: "Регистрация пользователя",
			requestBody: {
				description: "Данные для регистрации",
				required: true,
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/SignUpRequest",
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Пользователь успешно зарегистрирован",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/AuthResponse",
							},
						},
					},
				},
				"400": {
					description: "Некорректные данные для регистрации",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ErrorResponse",
							},
							example: {
								success: false,
								error: "Отсутствуют обязательные поля: email, phone",
								type: "SIGN_UP",
								fields: [ "email", "phone" ],
							},
						},
					},
				},
				"409": {
					description: "Пользователь с такими данными уже существует",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ErrorResponse",
							},
							examples: {
								emailConflict: {
									value: {
										success: false,
										error: "Пользователь с email ivan@example.com уже существует",
										type: "SIGN_UP",
										field: "email",
									},
								},
								phoneConflict: {
									value: {
										success: false,
										error: "Пользователь с телефоном +79681185555 уже существует",
										type: "SIGN_UP",
										field: "phone",
									},
								},
							},
						},
					},
				},
				"500": {
					description: "Ошибка сервера",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ErrorResponse",
							},
						},
					},
				},
			},
		},
	},
	"/sign-in": {
		post: {
			summary: "Авторизация пользователя",
			requestBody: {
				description: "Данные для входа",
				required: true,
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/SignInRequest",
						},
					},
				},
			},
			responses: {
				"200": {
					description: "Пользователь успешно авторизован",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/AuthResponse",
							},
						},
					},
				},
				"400": {
					description: "Некорректные данные для авторизации",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ErrorResponse",
							},
							example: {
								success: false,
								error: "Отсутствуют обязательные поля: email, password",
								type: "SIGN_IN",
								fields: [ "email", "password" ],
							},
						},
					},
				},
				"401": {
					description: "Неверный email или пароль",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ErrorResponse",
							},
							example: {
								success: false,
								error: "Неверный email или пароль",
								type: "SIGN_IN",
							},
						},
					},
				},
				"403": {
					description: "Пользователь уже авторизован",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ErrorResponse",
							},
							example: {
								success: false,
								error: "Вы уже авторизованы в системе",
								type: "SIGN_IN",
							},
						},
					},
				},
				"500": {
					description: "Ошибка сервера",
					content: {
						"application/json": {
							schema: {
								$ref: "#/components/schemas/ErrorResponse",
							},
						},
					},
				},
			},
		},
	},
	"/logout": {
		get: {
			summary: "Выход пользователя из системы",
			responses: {
				"200": {
					description: "Пользователь успешно вышел из системы",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									success: {
										type: "boolean",
										example: true,
									},
								},
							},
						},
					},
				},
				"401": {
					description: "Пользователь не авторизован",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									success: {
										type: "boolean",
										example: false,
									},
									error: {
										type: "string",
										example: "Пользователь не авторизован",
									},
								},
							},
						},
					},
				},
			},
		},
	},
};

export default authPath;