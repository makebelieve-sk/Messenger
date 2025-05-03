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
		update();

		window.addEventListener("resize", update);

		return () => window.removeEventListener("resize", update);
	}, [ update ]);

	return size;
};