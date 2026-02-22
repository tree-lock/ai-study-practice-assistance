"use client";

import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { SWRProvider } from "@/components/swr-provider";

function MuiThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: {
            main: "#2196f3",
          },
          secondary: {
            main: "#f50057",
          },
          error: {
            main: "#f44336",
          },
          warning: {
            main: "#ff9800",
          },
          info: {
            main: "#2196f3",
          },
          success: {
            main: "#4caf50",
          },
        },
        typography: {
          fontFamily:
            '"Noto Sans SC", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
              },
            },
          },
        },
      }),
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SWRProvider>{children}</SWRProvider>
    </ThemeProvider>
  );
}

export default MuiThemeProvider;
