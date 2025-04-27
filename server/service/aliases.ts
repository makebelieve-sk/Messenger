import moduleAlias from "module-alias";
import { join, resolve } from "path";

// Устанавливаем алиасы в зависимости от окружения
if (process.env.NODE_ENV === "production") {
	const ROOT_DIR = resolve(__dirname, "..");

	moduleAlias.addAliases({
		"@config": join(ROOT_DIR, "config"),
		"@core": join(ROOT_DIR, "core"),
		"@errors": join(ROOT_DIR, "errors"),
		"@locales": join(ROOT_DIR, "locales"),
		"@migrations": join(ROOT_DIR, "migrations"),
		"@service": join(ROOT_DIR, "service"),
		"@custom-types": join(ROOT_DIR, "types"),
		"@utils": join(ROOT_DIR, "utils"),
	});
}
