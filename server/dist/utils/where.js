"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchWhere = void 0;
const logger_1 = __importDefault(require("@service/logger"));
const logger = (0, logger_1.default)("utils/where");
// Формирование запроса для поиска (для сообщений, диалогов, друзей) или просто возврат обработанной строки
const getSearchWhere = (search, colname = undefined, sequelize = undefined) => {
    logger.debug("getSearchWhere [search=%s, colname=%s]", search, colname);
    if (!search) {
        return "";
    }
    const prepearedSearch = search
        .replace(/\`\'\.\,\;\:\\\//g, "\"")
        .trim()
        .toLowerCase();
    if (!colname) {
        return prepearedSearch;
    }
    if (sequelize) {
        return sequelize.where(sequelize.fn("LOWER", sequelize.col(colname)), "LIKE", `%${prepearedSearch}%`);
    }
    return null;
};
exports.getSearchWhere = getSearchWhere;
//# sourceMappingURL=where.js.map