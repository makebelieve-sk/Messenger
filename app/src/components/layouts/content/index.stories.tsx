import type { Meta, StoryObj } from "@storybook/react";

import ContentLayoutComponent from "@components/layouts/content";

const meta: Meta<typeof ContentLayoutComponent> = {
	title: "Layouts/ContentLayoutComponent",
	component: ContentLayoutComponent,
	tags: [ "autodocs" ],
};

export default meta;

type Story = StoryObj<typeof ContentLayoutComponent>;

export const Default: Story = {
	args: {
		children: <div style={{ background: "#eee", padding: "20px" }}>Default content</div>,
	},
};

export const WithLongContent: Story = {
	args: {
		children: (
			<div>
				<h3>Title</h3>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio.
					Praesent libero. Sed cursus ante dapibus diam.
				</p>
			</div>
		),
	},
};
