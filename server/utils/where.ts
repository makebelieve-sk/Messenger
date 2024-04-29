import { Sequelize } from "sequelize";

// Формирование запроса для поиска (для сообщений, диалогов, друзей) или просто возврат обработанной строки
export const getSearchWhere = (search: string, colname: string | undefined = undefined, sequelize: Sequelize | undefined = undefined) => {
    if (!search) {
        return "";
    }

    const prepearedSearch = search.replace(/\`\'\.\,\;\:\\\//g, "\"").trim().toLowerCase();

    if (!colname) {
        return prepearedSearch;
    }

    if (sequelize) {
        return sequelize.where(sequelize.fn("LOWER", sequelize.col(colname)), "LIKE", `%${prepearedSearch}%`);
    }

    return null;
};