import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import MainClientProvider from "@components/main/MainClientProvider";

import "@service/i18n";
import "@styles/index.scss";

const root = document.getElementById("root");

if (!root) {
	throw new Error("The root element is not found");
}

createRoot(root).render(
	<BrowserRouter>
		<MainClientProvider />
	</BrowserRouter>,
);
