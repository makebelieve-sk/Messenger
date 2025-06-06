import { type Ref, useCallback, useEffect, useState } from "react";

// Возвращает текущие размеры элемента (переданного по ref)
export default function useResize(ref: Ref<HTMLElement | null>) {
	const [ size, setSize ] = useState({ width: 0, height: 0 });

	const update = useCallback(() => {
		/**
		 * Сложная проверка, потому что тип ForwardRef не содержит поля current.
		 * Поэтому вместо него пишем тип Ref.
		 */
		if (ref && "current" in ref && ref.current) {
			const { width, height } = ref.current.getBoundingClientRect();
			setSize({ width, height });
		}
	}, [ ref ]);

	useEffect(() => {
		if (!ref || !("current" in ref) || !ref.current) return;

		// Сразу замерим высоту и ширину контейнера
		update();

		/**
		 * Подписываемся на любые изменения размеров.
		 * Событие resize реагирует только на изменение высоты окна.
		 * Поэтому используем ResizeObserver, который будет реагировать даже на удаление некоторых элементов 
		 * (раздел "Друзья", удаляем вкладки "Мои друзья" и тп)
		 */
		const ro = new ResizeObserver(() => {
			update();
		});

		// Подписываемся на изменение родительского рефа (именно того блока, в котором отрисовываем виртуальный список)
		ro.observe(ref.current);

		// Очищаем
		return () => {
			ro.disconnect();
		};
	}, [ ref, update ]);

	return size;
};