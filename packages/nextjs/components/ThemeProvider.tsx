"use client";

import * as React from "react";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const muiTheme = createTheme({
  typography: {
    fontFamily: '"Rubik", sans-serif',
  },
  palette: {
    mode: "dark",
    background: {
      default: "#141414",
      paper: "#1e1e1e",
    },
  },
});

export const ThemeProvider = ({ children, ...props }: any) => {
  return (
    <NextThemesProvider {...props}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </NextThemesProvider>
  );
};
