import fs from "fs";
import path from "path";
import { Sequelize, Transaction } from "sequelize";

export default {
    up: async (sequelize: Sequelize, transaction: Transaction) => {
        const sqlFilePath = path.join(__dirname, "../", "/sql/init.sql");
        const sql = fs.readFileSync(sqlFilePath, "utf8");

        await sequelize.query(sql, { transaction });
    },
    down: async (sequelize: Sequelize, transaction: Transaction) => {
        const sqlFilePath = path.join(__dirname, "../", "/sql/drop.sql");
        const sql = fs.readFileSync(sqlFilePath, "utf8");

        await sequelize.query(sql, { transaction });
    }
};