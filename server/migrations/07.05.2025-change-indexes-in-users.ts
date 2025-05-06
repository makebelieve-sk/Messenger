import fs from "fs";
import path from "path";
import type { Sequelize, Transaction } from "sequelize";

const SQL_DIR = "sql";

export default {
	up: async (sequelize: Sequelize, transaction: Transaction | undefined = undefined) => {
		const sqlFilePath = path.join(__dirname, "../", SQL_DIR, "change-indexes-in-users.sql");
		const sql = fs.readFileSync(sqlFilePath, "utf8");

		await sequelize.query(sql, { transaction });
	},
	down: async (sequelize: Sequelize, transaction: Transaction | undefined = undefined) => {
		const sqlFilePath = path.join(__dirname, "../", SQL_DIR, "remove-indexes-in-users.sql");
		const sql = fs.readFileSync(sqlFilePath, "utf8");

		await sequelize.query(sql, { transaction });
	},
};
