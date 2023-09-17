"use client";
import { ThemeProvider } from "@emotion/react";
import { createTheme, CssBaseline } from "@mui/material";
import { LayoutContainer } from "./components/LayoutContainer";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Page() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <LayoutContainer />
    </ThemeProvider>
  );
}
