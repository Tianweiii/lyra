"use client";

import * as React from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-montserrat)",
  },
});

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider {...props}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </NextThemesProvider>
  );
};
