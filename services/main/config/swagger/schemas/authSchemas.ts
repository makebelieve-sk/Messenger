 const authSchemas = {
	SignUpRequest: {
		type: "object",
		properties: {
			firstName: {
				type: "string",
				minLength: 2,
				maxLength: 50,
				example: "Иван",
			},
			thirdName: {
				type: "string",
				minLength: 2,
				maxLength: 50,
				example: "Иванов",
			},
			email: {
				type: "string",
				format: "email",
				example: "user9@example.com",
			},
			phone: {
				type: "string",
				pattern: "^\\+7\\d{10}$",
				example: "+79681185558",
			},
			password: {
				type: "string",
				minLength: 8,
				pattern: "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$",
				example: "StrongPass123",
			},
		},
		required: [ "firstName", "thirdName", "email", "phone", "password" ],
	},

	AuthResponse: {
		type: "object",
		properties: {
			success: {
				type: "boolean",
				example: true,
			},
			user: {
				$ref: "#/components/schemas/User",
			},
			userDetails: {
				$ref: "#/components/schemas/UserDetails",
			},
		},
	},

	ErrorResponse: {
		type: "object",
		properties: {
			success: {
				type: "boolean",
				example: false,
			},
			error: {
				type: "string",
				example: "Error message",
			},
			type: {
				type: "string",
				enum: [ "SIGN_UP", "SIGN_IN" ],
				example: "SIGN_UP",
			},
			fields: {
				type: "array",
				items: { type: "string" },
				example: [ "email", "phone" ],
			},
		},
	},

	SignInRequest: {
		type: "object",
		properties: {
			email: {
				type: "string",
				format: "email",
				example: "user999@example.com",
			},
			password: {
				type: "string",
				example: "StrongPass123",
			},
			rememberMe: {
				type: "boolean",
				example: false,
				description: "Флаг 'Запомнить меня'",
			},
		},
		required: [ "email", "password" ],
	},
};

export default authSchemas;