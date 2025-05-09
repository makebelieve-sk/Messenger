export * from "./src/enums";
export * from "./src/types";

/**
 * При запуске npm i в папке messanger/app или messanger/server, npm автоматически вызывает команду prepare 
 * в модулях. Поэтому нет нужны делать сборку модуля перед использованием. Также, он автоматически 
 * подтягивает изменения между настоящим кодом в packages и подключенным в node_modules.
 */