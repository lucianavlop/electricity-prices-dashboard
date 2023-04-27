import React from "react"
import { ThemeProvider } from "@mui/material/styles"
import { lightTheme, darkTheme } from "Themes"
import Dashboard from "pages/Dashboard"
import { Box, CssBaseline, createTheme, useMediaQuery } from "@mui/material"

function App() {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")

    const theme = React.useMemo(
        () =>
            createTheme({
                ...(prefersDarkMode ? darkTheme : lightTheme),
            }),
        [prefersDarkMode],
    )
    return (
        <>
            <ThemeProvider theme={theme}>
                <Box sx={{ display: "flex" }}>
                    <CssBaseline />
                    <Dashboard />
                </Box>
            </ThemeProvider>
        </>
    )
}

export default App
