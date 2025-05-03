import { type CSSProperties, memo, type ReactElement, type ReactNode } from "react";

import SpinnerComponent from "@components/ui/spinner";

import "./row.scss";

interface IListRow<T> {
    index: number;
    style: CSSProperties;
    data: {
        items: T[];
        itemWidth: number;
        hasMore: boolean;
    };
    options: {
        cols: number;
        gap: number;
        itemHeight: number;
    };
    renderCb: (props: { item: T, itemWidth: number, itemHeight: number; }) => ReactNode;
};

/**
 * Элемент, который отрисовывается в строке виртуального списка. 
 * Мемоизирован, так что перерисовывается только при изменении props.
 * Из родителььского компонента передаются стили для размещения элемента в строке.
 * Количество элементов в строке определяется в месте использования компонента виртуального списка.
 */
export default memo(function ListRow<T extends { id: string }>({ index, style, data, options, renderCb }: IListRow<T>) {
	const { cols, gap, itemHeight } = options;
	const { items, itemWidth, hasMore } = data;
	const start = index * cols;
	const rowItems = items.slice(start, start + cols);

	// Строка со спиннером загрузки (идет последняя в списке)
	if (!rowItems.length && hasMore) {
		return <div className="list__loading-row" style={style}>
			<SpinnerComponent />
		</div>;
	}

	// Обычная строка с картинками
	return <div className="list__row" style={{ ...style, gap }}>
		{rowItems.map(item => renderCb({ item, itemWidth, itemHeight }))}
	</div>;
}) as <T extends { id: string; }>(props: IListRow<T>) => ReactElement;