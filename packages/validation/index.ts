// Общие схемы валидации
export * from "./src/base/user";
export * from "./src/base/message";

// Схемы валидации сокет-соединения
export * from "./src/socket/messages";
export * from "./src/socket/users";
export * from "./src/socket/friends"; 
export * from "./src/socket/main"; 

// Вспомогательные функции валидации и их типы
export * from "./src/utils/validate-events";
export * from "./src/utils/server-schemas";
export * from "./src/utils/client-schemas";