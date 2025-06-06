import { emailCheck } from "@utils/email-check";

describe("emailCheck", () => {
	const validEmails = [
		"user@example.com",
		"USER@foo.COM",
		"user.name+tag+sorting@example.co.uk",
		"user_name@example.io",
		"user-name@sub.domain.com",
		"\"user@name\"@example.com",
		"user@[192.168.0.1]",
	];

	const invalidEmails = [
		"plainaddress",
		"@no-local-part.com",
		"Outlook Contact <outlook-contact@domain.com>",
		"no-at.domain.com",
		"user@.invalid.com",
		"user@invalid..com",
		"user@invalid,com",
		"user@invalid com",
		"user@@doubleat.com",
		"\"unclosed_quote@example.com",
	];

	test.each(validEmails)("returns truthy for valid email: %s", email => {
		expect(emailCheck(email)).not.toBeNull();
	});

	test.each(invalidEmails)("returns null for invalid email: %s", email => {
		expect(emailCheck(email)).toBeNull();
	});
});
