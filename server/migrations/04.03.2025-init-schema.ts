import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";

export default {
    up: async (sequelize: Sequelize) => {
        const sqlFilePath = path.join(__dirname, "../", "/sql/init.sql");
        const sql = fs.readFileSync(sqlFilePath, "utf8");

        await sequelize.query(sql);
    },
    down: async (sequelize: Sequelize) => {
        const sqlFilePath = path.join(__dirname, "../", "/sql/drop.sql");
        const sql = fs.readFileSync(sqlFilePath, "utf8");

        await sequelize.query(sql);
    }
};