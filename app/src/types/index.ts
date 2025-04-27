// В данном файле хранятся общие абстрактные типы, применимые на всем уровне клиента

export type ValueOf<T> = T[keyof T];

export type TimeoutType = ReturnType<typeof setTimeout>;
