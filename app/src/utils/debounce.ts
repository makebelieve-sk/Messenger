import { type TimeoutType } from "common-types";

// Функция отложенного вызова
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function debounce<F extends (...args: any[]) => void>(fn: F, wait: number): (...args: Parameters<F>) => void {
	let timer: TimeoutType | null = null;

	return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
		if (timer !== null) {
			clearTimeout(timer);
		}

		timer = setTimeout(() => {
			// Важно вызывать именно через apply, чтобы this не потерялся
			fn.apply(this, args);
		}, wait);
	};
};