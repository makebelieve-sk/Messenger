import path from "path";
import moduleAlias from "module-alias";

// Устанавливаем алиасы в зависимости от окружения
if (process.env.NODE_ENV === "production") {
    moduleAlias.addAliases({
        "@core": path.resolve(__dirname, "../core"),
        "@database": path.resolve(__dirname, "../database"),
        "@errors": path.resolve(__dirname, "../errors"),
        "@locales": path.resolve(__dirname, "../locales"),
        "@migrations": path.resolve(__dirname, "../migrations"),
        "@service": path.resolve(__dirname, "../service"),
        "@custom-types": path.resolve(__dirname, "../types"),
        "@utils": path.resolve(__dirname, "../utils")
    });
}