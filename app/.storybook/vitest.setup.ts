import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react";

import * as projectAnnotations from "./preview";

// Это важный шаг для применения правильной конфигурации при тестировании ваших историй.
// Дополнительная информация по адресу: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);