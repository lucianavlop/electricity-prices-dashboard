import React, { useEffect } from "react"
import { ThemeProvider } from "@mui/material/styles"
import { lightTheme, darkTheme } from "Themes"
import Dashboard from "pages/Dashboard"
import { Box, CssBaseline, createTheme, useMediaQuery } from "@mui/material"
import TypesafeI18n from "i18n/i18n-react"
import { loadLocale } from "i18n/i18n-util.sync"
import { Locales } from "i18n/i18n-types"
import mixpanel from "mixpanel-browser"

mixpanel.init("c22c74cac287fb74387b7ce250f1548f")

function App() {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
    const locale: Locales = navigator?.language.startsWith("en") ? "en" : "es"

    useEffect(() => {
        mixpanel.track("Website Accessed")
    }, [])

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
