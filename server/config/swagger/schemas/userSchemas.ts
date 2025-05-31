export const userSchemas = {
	User: {
		type: "object",
		properties: {
			id: { type: "string", example: "9BBD6D0F-B37C-4827-9093-5A40E8BF9CB8" },
			email: { type: "string", example: "user@example.com" },
			firstName: { type: "string", example: "John" },
			thirdName: { type: "string", example: "Smith" },
		},
		required: [ "id", "email" ],
	},
	UserDetails: {
		type: "object",
		properties: {
			birthday: { type: "string", format: "date", example: "1990-01-01" },
			sex: { type: "string", example: "male" },
			city: { type: "string", example: "New York" },
			work: { type: "string", example: "Engineer" },
		},
	},
	UserEdit: {
		type: "object",
		properties: {
			email: { type: "string", format: "email", example: "user@mail.com" },
			name: { type: "string", example: "John" },
			surName: { type: "string", example: "Smith" },
			birthday: { type: "string", format: "date", example: "1990-01-01" },
			sex: { type: "string", example: "male", enum: [ "male", "female", "other" ] },
			city: { type: "string", example: "New York" },
			work: { type: "string", example: "Engineer" },
			phone: { type: "string", example: "+79681185555" },
		},
		required: [ "name", "surName", "email", "phone" ],
	},
};