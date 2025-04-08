import path from "path";
import { fileURLToPath } from "url";

import { defineWorkspace } from "vitest/config";

import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Более подробная информация по адресу: https://storybook.js.org/docs/writing-tests/test-addon
export default defineWorkspace([
  "vitest.config.ts",
  {
    extends: "vitest.config.ts",
    plugins: [
      // Плагин будет запускать тесты для историй, определенных в конфигурации Storybook
      // Смотрите параметры по адресу: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
      storybookTest({ configDir: path.join(dirname, ".storybook") }),
    ],
    test: {
      name: "storybook",
      browser: {
        enabled: true,
        headless: true,
        name: "chromium",
        provider: "playwright"
      },
      setupFiles: [".storybook/vitest.setup.ts"],
    },
  },
]);
