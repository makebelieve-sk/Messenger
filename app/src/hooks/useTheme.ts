import { useMemo, useState } from "react";
import { createTheme } from "@mui/material/styles";

import { ThemeTypes } from "@custom-types/enums";

// Создание единой цветовой темы
export default function useTheme() {
	const [ isDarkMode, setIsDarkMode ] = useState(false);

	const THEME = useMemo(() =>
		createTheme({
			palette: {
				mode: isDarkMode ? ThemeTypes.DARK : ThemeTypes.LIGHT,
			},
		}), 
	[ isDarkMode ],
	);

	return { THEME, setIsDarkMode };
}