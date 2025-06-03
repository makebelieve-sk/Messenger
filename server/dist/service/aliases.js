"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const module_alias_1 = __importDefault(require("module-alias"));
const path_1 = require("path");
// Устанавливаем алиасы в зависимости от окружения
if (process.env.NODE_ENV === "production") {
    const ROOT_DIR = (0, path_1.resolve)(__dirname, "..");
    module_alias_1.default.addAliases({
        "@config": (0, path_1.join)(ROOT_DIR, "config"),
        "@core": (0, path_1.join)(ROOT_DIR, "core"),
        "@errors": (0, path_1.join)(ROOT_DIR, "errors"),
        "@locales": (0, path_1.join)(ROOT_DIR, "locales"),
        "@migrations": (0, path_1.join)(ROOT_DIR, "migrations"),
        "@service": (0, path_1.join)(ROOT_DIR, "service"),
        "@custom-types": (0, path_1.join)(ROOT_DIR, "types"),
        "@utils": (0, path_1.join)(ROOT_DIR, "utils"),
    });
}
//# sourceMappingURL=aliases.js.map