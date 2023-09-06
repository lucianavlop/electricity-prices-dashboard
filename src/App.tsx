import React from "react"
import { ThemeProvider } from "@mui/material/styles"
import { lightTheme, darkTheme } from "Themes"
import Dashboard from "pages/Dashboard"
import { Box, CssBaseline, createTheme, useMediaQuery } from "@mui/material"
import TypesafeI18n from "i18n/i18n-react"
import { loadLocale } from "i18n/i18n-util.sync"
import { Locales } from "i18n/i18n-types"

function App() {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
    const locale: Locales = navigator?.language.startsWith("en") ? "en" : "es"

    const theme = React.useMemo(
        () =>
            createTheme({
                ...(prefersDarkMode ? darkTheme : lightTheme),
            }),
        [prefersDarkMode],
    )
    loadLocale(locale)
    return (
        <>
            <ThemeProvider theme={theme}>
                <Box sx={{ display: "flex" }}>
                    <CssBaseline />
                    <TypesafeI18n locale={locale}>
                        <Dashboard />
                    </TypesafeI18n>
                </Box>
            </ThemeProvider>
        </>
    )
}

export default App
