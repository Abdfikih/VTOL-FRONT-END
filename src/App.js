import React from "react";
import { Route, Routes } from "react-router-dom";
import theme from "./styles/theme";
import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Controls from "./pages/Controls";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Home />} exact />
        <Route path="/Settings" element={<Settings />} exact />
        <Route path="/Controls" element={<Controls />} exact />
	<Route path="*" element={<Home />} exact />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
