import { Container, Grid, Typography, useTheme } from "@mui/material"
import React from "react"
import { ArrowUpward, ArrowDownward } from "@mui/icons-material"
import { formatEuro } from "services/PriceService"

interface MetricCardProps {
    label: string
    value: number
    delta?: number
}

const ensurePositive = (number: number) => {
    if (number < 0) {
        number = -number // convert negative number to positive
    }

    return number
}

const Metric: React.FC<MetricCardProps> = ({ label, value, delta }) => {
    const theme = useTheme()

    return (
        <Container>
            <Typography color="textSecondary" gutterBottom>
                {label}
            </Typography>
            <Typography variant="h2" component="h2">
                {formatEuro(value)}
            </Typography>
            {delta && (
                <Grid container alignItems="center" spacing={1}>
                    <Grid item>
                        {delta >= 0 ? (
                            <ArrowDownward color="success" />
                        ) : (
                            <ArrowUpward color="error" />
                        )}
                    </Grid>
                    <Grid item>
                        <Typography
                            variant="body2"
                            color={
                                typeof delta === "number" && delta >= 0
                                    ? theme.palette.success.main
                                    : theme.palette.error.main
                            }>
                            {formatEuro(ensurePositive(delta))}
                        </Typography>
                    </Grid>
                </Grid>
            )}
        </Container>
    )
}

export default Metric
