import { useMemo, useState } from "react";
import { createTheme } from "@mui/material/styles";

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