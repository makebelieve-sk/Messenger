import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { Button } from "./Button";

// Подробнее о том, как настроить истории: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
	title: "Example/Button",
	component: Button,
	parameters: {
		// Необязательный параметр для центрирования компонента на холсте. Дополнительная информация: https://storybook.js.org/docs/configure/story-layout
		layout: "centered",
	},
	// Этот компонент будет иметь автоматически сгенерированную запись Autodocs.: https://storybook.js.org/docs/writing-docs/autodocs
	tags: [ "autodocs" ],
	// Подробнее о argTypes: https://storybook.js.org/docs/api/argtypes
	argTypes: {
		backgroundColor: { control: "color" },
	},
	/**
	 * Используйте `fn` для отслеживания аргумента onClick, который появится на панели действий после вызова.
	 * https://storybook.js.org/docs/essentials/actions#action-args
	 */
	args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Подробнее о написании историй с помощью args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
	args: {
		primary: true,
		label: "Button",
	},
};

export const Secondary: Story = {
	args: {
		label: "Button",
	},
};

export const Large: Story = {
	args: {
		size: "large",
		label: "Button",
	},
};

export const Small: Story = {
	args: {
		size: "small",
		label: "Button",
	},
};
