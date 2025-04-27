import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { Header } from "./Header";

const meta = {
	title: "Example/Header",
	component: Header,
	// Этот компонент будет иметь автоматически сгенерированную запись Autodocs: https://storybook.js.org/docs/writing-docs/autodocs
	tags: [ "autodocs" ],
	parameters: {
		// Подробнее о том, как позиционировать истории: https://storybook.js.org/docs/configure/story-layout
		layout: "fullscreen",
	},
	args: {
		onLogin: fn(),
		onLogout: fn(),
		onCreateAccount: fn(),
	},
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
	args: {
		user: {
			name: "Jane Doe",
		},
	},
};

export const LoggedOut: Story = {};
