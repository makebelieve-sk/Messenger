import { render } from "@testing-library/react";

import VirtualList from "@modules/virtual-list/list";

jest.mock("react-window", () => ({
	FixedSizeList: ({ children, itemData }) => (
		<div data-testid="virtual-list">
			{children({ index: 0, style: {}, data: itemData })}
		</div>
	),
}));

jest.mock("react-window-infinite-loader", () => ({
	__esModule: true,
	default: ({ children }) => children({ onItemsRendered: jest.fn(), ref: jest.fn() }),
}));

describe("VirtualList", () => {
	const mockItems = [
		{ id: "1", name: "Item 1" },
		{ id: "2", name: "Item 2" },
		{ id: "3", name: "Item 3" },
	];

	const defaultProps = {
		virtualRef: { current: null },
		items: mockItems,
		options: {
			cols: 3,
			gap: 10,
			itemHeight: 200,
		},
		hasMore: true,
		emptyText: "No items found",
		isLoading: false,
		loadMore: jest.fn(),
		renderCb: ({ item }) => <div data-testid={`item-${item.id}`}>{item.name}</div>,
		onScroll: jest.fn(),
		limit: 10,
	};

	it("renders loading state correctly", () => {
		const { container } = render(
			<VirtualList
				{...defaultProps}
				items={[]}
				isLoading={true}
			/>,
		);
		expect(container).toMatchSnapshot();
	});

	it("renders empty state correctly", () => {
		const { container } = render(
			<VirtualList
				{...defaultProps}
				items={[]}
				isLoading={false}
			/>,
		);
		expect(container).toMatchSnapshot();
	});

	it("renders items correctly", () => {
		const { container } = render(
			<VirtualList {...defaultProps} />,
		);
		expect(container).toMatchSnapshot();
	});

	it("renders with different column count", () => {
		const { container } = render(
			<VirtualList
				{...defaultProps}
				options={{
					...defaultProps.options,
					cols: 2,
				}}
			/>,
		);
		expect(container).toMatchSnapshot();
	});

	it("renders with hasMore set to false", () => {
		const { container } = render(
			<VirtualList
				{...defaultProps}
				hasMore={false}
			/>,
		);
		expect(container).toMatchSnapshot();
	});

	it("renders with custom empty text", () => {
		const { container } = render(
			<VirtualList
				{...defaultProps}
				items={[]}
				emptyText="Custom empty message"
			/>,
		);
		expect(container).toMatchSnapshot();
	});
});
