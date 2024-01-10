import React, { useCallback, useEffect, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import PriceChart from "components/PriceChart"
import { getDailyPriceInfo, getDailyAverages } from "services/PriceService"
import { Container } from "@mui/material"
import { DailyPriceInfo } from "models/DailyPriceInfo"
import { DayRating } from "models/DayRating"
import { useI18nContext } from "i18n/i18n-react"
import { useDateTime } from "hooks/RegionalDateTime"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon"
import { DateTime } from "luxon"
import { DailyAverage } from "models/DailyAverage"
import DailyAverageChart from "components/DailyAverageChart"
import DailyInfo from "components/DailyInfo"
import WithLoading from "components/WithLoading"

const DashboardContent: React.FC = () => {
    const { LL } = useI18nContext()
    const { now, fromISO } = useDateTime()
    const [currentDate, setCurrentDate] = useState(now())
    const [pricesToday, setPricesToday] = useState<DailyPriceInfo | undefined>()
    const [pricesTomorrow, setPricesTomorrow] = useState<
        DailyPriceInfo | undefined
    >()
    const [dailyAverages, setDailyAverages] = useState<DailyAverage[]>([])

    const [isLoading, setLoading] = useState(true)

    const reloadData = useCallback(
        (date?: DateTime<boolean>) => {
            setLoading(true)
            setCurrentDate(date ?? now())
        },
        [now, setLoading],
    )

    useEffect(() => {
        getDailyPriceInfo(currentDate)
            .then(prices => {
                if (prices) setPricesToday(prices)
            })
            .finally(() => setTimeout(() => setLoading(false), 300))
    }, [currentDate])

    useEffect(() => {
        const fetchData = async () => {
            const tomorrow = now().plus({ days: 1 })

            const prices = await getDailyPriceInfo(tomorrow)
            if (prices === null) {
                setPricesTomorrow(undefined)
            } else {
                setPricesTomorrow(prices)
            }
        }
        fetchData()
    }, [now])

    useEffect(() => {
        const fetchData = async () => {
            const averages = await getDailyAverages(currentDate)

            if (averages) setDailyAverages(averages)
        }
        fetchData()
    }, [currentDate])

    useEffect(() => {
        const fetchData = () => reloadData()
        // Calculate time remaining until the start of the next hour
        const currTime = now()
        const nextHour = currTime.startOf("hour").plus({ hour: 1 })
        const millisecondsUntilNextHour = nextHour.diff(
            currTime,
            "milliseconds",
        ).milliseconds

        // Set a timeout to execute the function when the next hour starts
        const timeoutId = setTimeout(() => {
            fetchData()

            // Set an interval to execute the function every hour thereafter
            const intervalId = setInterval(fetchData, 60 * 60 * 1000) // 60 minutes * 60 seconds * 1000 milliseconds

            // Cleanup function to clear the interval when the component is unmounted
            return () => {
                clearInterval(intervalId)
            }
        }, millisecondsUntilNextHour)

        // Cleanup function to clear the timeout when the component is unmounted
        return () => {
            clearTimeout(timeoutId)
        }
    }, [reloadData, now])

    const isToday = useMemo(
        () => currentDate.hasSame(now(), "day"),
        [currentDate, now],
    )

    const average = useMemo(() => {
        return (
            dailyAverages.reduce(
                (accumulator, med) => accumulator + med.average,
                0,
            ) / dailyAverages.length
        )
    }, [dailyAverages])

    const currentRatingText = useMemo(() => {
        const date = currentDate.toFormat("dd/MM")

        switch (pricesToday?.dayRating) {
            case DayRating.BAD:
                return LL.CURRENT_RATING_BAD({
                    currentDate: date,
                })
            case DayRating.GOOD:
                return LL.CURRENT_RATING_GOOD({
                    currentDate: date,
                })
            default:
                return LL.CURRENT_RATING_NORMAL({
                    currentDate: date,
                })
        }
    }, [pricesToday, currentDate, LL])

    const tomorrowRatingText = useMemo(() => {
        if (!pricesTomorrow || pricesTomorrow.prices.length === 0)
            return LL.TOMORROW_NO_DATA()

        const date = fromISO(pricesTomorrow.prices[0].dateTime).toFormat(
            "dd/MM",
        )

        switch (pricesTomorrow?.dayRating) {
            case DayRating.BAD:
                return LL.TOMORROW_RATING_BAD({
                    currentDate: date,
                })
            case DayRating.GOOD:
                return LL.TOMORROW_RATING_GOOD({
                    currentDate: date,
                })
            default:
                return LL.TOMORROW_RATING_NORMAL({
                    currentDate: date,
                })
        }
    }, [pricesTomorrow, LL, fromISO])

    const handleDateChange = (date: DateTime | null) => {
        if (date) {
            reloadData(date)
        }
    }

    return (
        <WithLoading isLoading={isLoading}>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    height: "100vh",
                    overflow: "auto",
                }}>
                <Paper
                    sx={{
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}>
                    <Container sx={{ p: 2 }}>
                        <Typography
                            variant="h1"
                            component="h1"
                            align="left"
                            gutterBottom>
                            {LL.TITLE()}
                        </Typography>
                    </Container>

                    <Container sx={{ p: 2 }}>
                        <LocalizationProvider dateAdapter={AdapterLuxon}>
                            <DatePicker
                                value={currentDate}
                                onChange={handleDateChange}
                                maxDate={now()}
                                format="dd/MM/yyyy"
                            />
                        </LocalizationProvider>
                    </Container>
                    <Container sx={{ p: 2 }}>
                        <Typography
                            variant="h2"
                            component="h2"
                            align="left"
                            gutterBottom>
                            {currentRatingText}
                        </Typography>
                    </Container>

                    <Container sx={{ p: 2 }}>
                        {pricesToday && (
                            <DailyInfo
                                dailyInfo={pricesToday}
                                thirtyDayAverage={average}
                            />
                        )}
                    </Container>

                    <Container sx={{ p: 2, height: "400px" }}>
                        {pricesToday && (
                            <PriceChart
                                prices={pricesToday.prices}
                                average={average}
                                chartId="Today"
                                dateFormat="HH:mm"
                                showCurrentPrice={isToday}
                                cheapestPeriods={pricesToday.cheapestPeriods}
                                expensivePeriods={pricesToday.expensivePeriods}
                            />
                        )}
                    </Container>

                    <Container sx={{ p: 2 }}>
                        <Typography
                            variant="h2"
                            component="h2"
                            align="left"
                            gutterBottom>
                            {tomorrowRatingText}
                        </Typography>
                    </Container>

                    {pricesTomorrow && (
                        <>
                            <Container sx={{ p: 2 }}>
                                <DailyInfo
                                    dailyInfo={pricesTomorrow}
                                    thirtyDayAverage={average}
                                />
                            </Container>

                            <Container sx={{ p: 2, height: "400px" }}>
                                <PriceChart
                                    prices={pricesTomorrow.prices}
                                    average={average}
                                    chartId="Tomorrow"
                                    dateFormat="HH:mm"
                                    showCurrentPrice={true}
                                    cheapestPeriods={
                                        pricesTomorrow.cheapestPeriods
                                    }
                                    expensivePeriods={
                                        pricesTomorrow.expensivePeriods
                                    }
                                />
                            </Container>
                        </>
                    )}

                    <Container sx={{ p: 2 }}>
                        <Typography
                            variant="h2"
                            component="h2"
                            align="left"
                            gutterBottom>
                            {LL.LAST_THIRTY_DAYS()}
                        </Typography>
                    </Container>
                    <Container sx={{ p: 2, height: "400px" }}>
                        <DailyAverageChart
                            averages={dailyAverages}
                            average={average}
                            chartId="DailyAverages"
                            dateFormat="MMM dd"
                        />
                    </Container>
                </Paper>
            </Box>
        </WithLoading>
    )
}

export default function Dashboard() {
    return <DashboardContent />
}
