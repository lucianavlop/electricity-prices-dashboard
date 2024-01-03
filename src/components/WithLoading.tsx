import React from "react"
import { CircularProgress, Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"

interface Props {
    isLoading: boolean
    children: React.ReactNode
}

const WithLoading: React.FC<Props> = ({ isLoading, children }) => {
    const theme = useTheme()

    const backgroundColor = theme.palette.background.default

    return (
        <Box
            position="relative"
            width="100%" // Fill the width of the parent component
            height="100%" // Fill the height of the parent component
        >
            {isLoading && (
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    bgcolor={backgroundColor} // Set background color from theme
                    style={{ opacity: 0.8 }} // Optional: Add transparency
                >
                    <CircularProgress />
                </Box>
            )}

            {children}
        </Box>
    )
}

export default WithLoading
