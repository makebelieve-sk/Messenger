import { render, screen } from "@testing-library/react";

import ListRow from "@modules/virtual-list/row";

describe("ListRow", () => {
	const mockStyle = { top: 0, height: 100 };
	const mockOptions = {
		cols: 3,
		gap: 10,
		itemHeight: 200,
	};

	const mockRenderCb = ({ item, itemWidth, itemHeight }) => (
		<div data-testid={`item-${item.id}`}>
			{item.name} ({itemWidth}x{itemHeight})
		</div>
	);

	it("renders loading row when no items and hasMore is true", () => {
		const data = {
			items: [],
			itemWidth: 300,
			hasMore: true,
		};

		const { container } = render(
			<ListRow
				index={0}
				style={mockStyle}
				data={data}
				options={mockOptions}
				renderCb={mockRenderCb}
			/>,
		);

		expect(screen.getByRole("progressbar")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("renders items row correctly", () => {
		const data = {
			items: [
				{ id: "1", name: "Item 1" },
				{ id: "2", name: "Item 2" },
				{ id: "3", name: "Item 3" },
			],
			itemWidth: 300,
			hasMore: false,
		};

		const { container } = render(
			<ListRow
				index={0}
				style={mockStyle}
				data={data}
				options={mockOptions}
				renderCb={mockRenderCb}
			/>,
		);

		expect(screen.getByTestId("item-1")).toBeInTheDocument();
		expect(screen.getByTestId("item-2")).toBeInTheDocument();
		expect(screen.getByTestId("item-3")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("renders correct number of items based on cols", () => {
		const data = {
			items: [
				{ id: "1", name: "Item 1" },
				{ id: "2", name: "Item 2" },
				{ id: "3", name: "Item 3" },
				{ id: "4", name: "Item 4" },
			],
			itemWidth: 300,
			hasMore: false,
		};

		const { container } = render(
			<ListRow
				index={0}
				style={mockStyle}
				data={data}
				options={{ ...mockOptions, cols: 2 }}
				renderCb={mockRenderCb}
			/>,
		);

		expect(screen.getByTestId("item-1")).toBeInTheDocument();
		expect(screen.getByTestId("item-2")).toBeInTheDocument();
		expect(screen.queryByTestId("item-3")).not.toBeInTheDocument();
		expect(screen.queryByTestId("item-4")).not.toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("applies correct styles to row", () => {
		const data = {
			items: [ { id: "1", name: "Item 1" } ],
			itemWidth: 300,
			hasMore: false,
		};

		const { container } = render(
			<ListRow
				index={0}
				style={mockStyle}
				data={data}
				options={mockOptions}
				renderCb={mockRenderCb}
			/>,
		);

		const row = container.firstChild as HTMLElement;
		expect(row).toHaveStyle({
			top: "0px",
			height: "100px",
			gap: "10px",
		});
		expect(container).toMatchSnapshot();
	});
});
