import type { ReactElement, ReactNode, Ref } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { FixedSizeList as List, type ListOnScrollProps } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";

import SpinnerComponent from "@components/ui/spinner";
import useResize from "@hooks/useResize";
import ListRow from "@modules/virtual-list/row";
import { PHOTOS_LIMIT } from "@utils/constants";

import "./list.scss";

interface IVirtualGrid<T> {
	virtualRef: Ref<VirtualListHandle | null>;
	items: T[];
	options: {
		cols: number;
		gap: number;
		itemHeight: number;
	};
	hasMore: boolean;
	emptyText: string;
	isLoading: boolean;
	loadMore: (startIndex?: number, stopIndex?: number) => void;
	renderCb: (props: { item: T, itemWidth: number, itemHeight: number; }) => ReactNode;
	onScroll: (options: ListOnScrollProps) => void;
};

export interface VirtualListHandle {
	scrollTop(): void;
};

/**
 * Главный компонент виртуального списка.
 * В DOM отрисовываются только те элементы, которые находятся в видимой области.
 * Пакет "react-window-infinite-loader" автоматически управляет загрузкой элементов (повторные запросы при быстром скролле не идут). 
 */
export default forwardRef(function VirtualList<T extends { id: string; }>(
	props: IVirtualGrid<T>,
	parentRef: Ref<HTMLDivElement | null>,
) {
	const { virtualRef, items, options, hasMore, emptyText, isLoading, loadMore, renderCb, onScroll } = props;
	const { cols, gap, itemHeight } = options;

	const listRef = useRef<HTMLDivElement  | null>(null);

	const { width, height } = useResize(parentRef);
	// Реф для предыдущего значения items.length
	const prevItemsLength = useRef(items.length);

	/**
	 * Если мы подгрузили мало фотографий (вдруг сменили PHOTOS_LIMIT) или экран большой, то
	 * грузит до тех пор, пока не заполнил строками весь экран.
	 */
	useEffect(() => {
		// Сколько строк видно на экране
		const visibleRows = Math.floor(height / (itemHeight + gap));
		// Сколько строк у нас уже есть (без «строки загрузки»)
		const rowsLoaded = Math.ceil(items.length / cols);

		// Условие «недостаточно для экрана»:
		const needFillScreen = visibleRows >= rowsLoaded;
		// Условие «удалили что-то»:
		const didDelete = items.length < prevItemsLength.current;

		if ((needFillScreen || didDelete) && hasMore && !isLoading) {
			loadMore();
		}

		// Обновляем предыдущее значение items.length
		prevItemsLength.current = items.length;
	}, [ items.length, height, items.length, hasMore, isLoading ]);

	// Добавляем метод скролла виртуальному рефу, определенному в родителе (скролл по кнопке "Вверх")
	useImperativeHandle(virtualRef, () => ({
		scrollTop: () => {
			listRef.current?.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		},
	}), []);

	// Динамический расчет общего количества строк
	const rowCount = useMemo(
		() => Math.ceil(items.length / cols) + (hasMore ? 1 : 0),
		[ items.length, hasMore ],
	);

	// Динамический расчет ширины картинки
	const itemWidth = useMemo(() => {
		return (width - (cols - 1) * gap) / cols;
	}, [ width ]);

	// Динамически проверяем есть ли уже этот ряд (загружен ли он)
	const isItemLoaded = useCallback((rowIndex: number) => {
		return rowIndex < Math.ceil(items.length / cols);
	}, [ items.length ]);

	// Генерируем уникальные ключи для каждой строки виртуального списка
	const getItemKey = useCallback((index: number) => {
		const first = items[index * cols];

		return first
			? `row-${first.id}`      // Ключ строки с фотографиями
			: `loading-${index}`;    // Ключ строки со спиннером загрузки
	}, [ items ]);

	/**
	 * Специально вынесено в useCallback, потому что react-window пересоздает каждый раз строку, 
	 * если указать ему для отрисовки анонимную функцию. Потому что она создается каждый раз при изменении элемента.
	 * В данном случае мы передаем в функцию отрисовки уже готовый объект, который не изменяется ни от каких параметров.
	 * Следовательно повторной отрисовки элемента при изменении высоты окна браузера не будет.
	 */
	const renderItem = useCallback(({ index, style, data }) => {
		return <ListRow<T>
			index={index}
			style={style}
			data={data}
			options={{ cols, gap, itemHeight }}
			renderCb={renderCb}
		/>;
	}, []);

	/**
	 * Показываем спиннер загрузки только в первый вход на страницу, последующие разы сбивают виртуальный список
	 * и он перерисовывается заново (скролл все время влзетает наверх).
	 */
	if (isLoading && !items.length) {
		return <div className="virtual-list__loading">
			<SpinnerComponent />
		</div>;
	}

	if (!items || !items.length) {
		return <div className="virtual-list__no-content opacity-text">
			{emptyText}
		</div>;
	}

	return <InfiniteLoader
		isItemLoaded={isItemLoaded}
		itemCount={rowCount}
		loadMoreItems={loadMore}
		threshold={2}
		minimumBatchSize={PHOTOS_LIMIT}
	>
		{({ onItemsRendered, ref: infiniteRef }) => {
			return <List
				ref={infiniteRef}
				outerRef={listRef}
				height={height}
				width={width}
				itemCount={rowCount}
				itemSize={itemHeight + gap}
				overscanCount={2}
				onItemsRendered={onItemsRendered}
				itemKey={getItemKey}
				itemData={{ items, itemWidth, hasMore }}
				onScroll={onScroll}
			>
				{renderItem}
			</List>;
		}}
	</InfiniteLoader>;
}) as <T extends { id: string; }>(props: IVirtualGrid<T> & { ref?: Ref<HTMLDivElement | null> }) => ReactElement;