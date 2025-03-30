import { createTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";

export default function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const THEME = useMemo(() =>
    createTheme({
      palette: {
        mode: isDarkMode ? "dark" : "light",
      },
    }), [isDarkMode]);

  return { THEME, setIsDarkMode };
}