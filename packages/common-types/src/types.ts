export type TimeoutType = ReturnType<typeof setTimeout>;

// Необходимо корректно указать тип аргументов => [infer _]
export type HandleArgsType<D extends (...args: any[]) => void> = Parameters<D> extends [infer R, infer _] ? R : unknown;