import moduleAlias from "module-alias";

// Устанавливаем алиасы в зависимости от окружения
if (process.env.NODE_ENV === "production") {
	moduleAlias.addAliases({
		"@config": "../config",
		"@core": "../core",
		"@errors": "../errors",
		"@locales": "../locales",
		"@migrations": "../migrations",
		"@service": "../service",
		"@custom-types": "../types",
		"@utils": "../utils",
	});
}
