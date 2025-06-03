"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SQL_DIR = "sql";
exports.default = {
    up: async (sequelize, transaction = undefined) => {
        const sqlFilePath = path_1.default.join(__dirname, "../", SQL_DIR, "change-indexes-in-users.sql");
        const sql = fs_1.default.readFileSync(sqlFilePath, "utf8");
        await sequelize.query(sql, { transaction });
    },
    down: async (sequelize, transaction = undefined) => {
        const sqlFilePath = path_1.default.join(__dirname, "../", SQL_DIR, "remove-indexes-in-users.sql");
        const sql = fs_1.default.readFileSync(sqlFilePath, "utf8");
        await sequelize.query(sql, { transaction });
    },
};
//# sourceMappingURL=07.05.2025-change-indexes-in-users.js.map