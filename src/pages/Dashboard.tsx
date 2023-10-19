import React, { useEffect, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import PriceChart from "components/PriceChart"
import { getDailyPriceInfo, getDailyMedians } from "services/PriceService"
import { Container, Grid } from "@mui/material"
import Metric from "components/Metric"
import { DailyPriceInfo } from "models/DailyPriceInfo"
import { DayRating } from "models/DayRating"
import { useI18nContext } from "i18n/i18n-react"
import { useDateTime } from "hooks/RegionalDateTime"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon"
import { DateTime } from "luxon"
import { DailyMedian } from "models/DailyMedian"
import DailyMedianChart from "components/DailyMedianChart"

const DashboardContent: React.FC = () => {
    const { LL } = useI18nContext()
    const { now, fromISO } = useDateTime()
    const [currentDate, setCurrentDate] = useState(now())
    const [currentPrices, setPricesToday] = useState<
        DailyPriceInfo | undefined
    >()
    const [pricesTomorrow, setPricesTomorrow] = useState<
        DailyPriceInfo | undefined
    >()
    const [dailyMedians, setDailyMedians] = useState<DailyMedian[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const prices = await getDailyPriceInfo(currentDate)
            if (prices) setPricesToday(prices)
        }
        fetchData()
    }, [currentDate])

    useEffect(() => {
        const fetchData = async () => {
            const tomorrow = now().plus({ days: 1 })

            const prices = await getDailyPriceInfo(tomorrow)
            if (prices === null) {
                setPricesTomorrow(undefined)
            } else {
                const last = prices.prices[prices.prices.length - 1]
                prices.prices.push({
                    price: last.price,
                    dateTime: last.dateTime.slice(0, -8) + "24:00:00",
                })
                setPricesTomorrow(prices)
            }
        }
        fetchData()
    }, [now])

    useEffect(() => {
        const fetchData = async () => {
            const medians = await getDailyMedians(currentDate)

            if (medians) setDailyMedians(medians)
        }
        fetchData()
    }, [currentDate])

    useEffect(() => {
        const fetchData = () => setCurrentDate(now())
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
    }, [now])

    const isToday = useMemo(
        () => currentDate.hasSame(now(), "day"),
        [currentDate, now],
    )

    const median = useMemo(() => {
        return (
            dailyMedians.reduce(
                (accumulator, med) => accumulator + med.median,
                0,
            ) / dailyMedians.length
        )
    }, [dailyMedians])

    const currentPrice = useMemo(() => {
        return (
            currentPrices?.prices.find(price => {
                const priceDateTimeInMadrid = fromISO(price.dateTime)

                return currentDate.hasSame(priceDateTimeInMadrid, "hour")
            }) ?? null
        )
    }, [currentPrices?.prices, fromISO, currentDate])

    const minPriceToday = useMemo(() => {
        if (!currentPrices) return null
        const min = Math.min(...currentPrices.prices.map(price => price.price))
        return currentPrices.prices.find(price => price.price === min) ?? null
    }, [currentPrices])

    const maxPriceToday = useMemo(() => {
        if (!currentPrices) return null
        const max = Math.max(...currentPrices.prices.map(price => price.price))
        return currentPrices.prices.find(price => price.price === max) ?? null
    }, [currentPrices])

    const minPriceTomorrow = useMemo(() => {
        if (!pricesTomorrow) return null
        const min = Math.min(...pricesTomorrow.prices.map(price => price.price))
        return pricesTomorrow.prices.find(price => price.price === min) ?? null
    }, [pricesTomorrow])

    const maxPriceTomorrow = useMemo(() => {
        if (!pricesTomorrow) return null
        const max = Math.max(...pricesTomorrow.prices.map(price => price.price))
        return pricesTomorrow.prices.find(price => price.price === max) ?? null
    }, [pricesTomorrow])

    const currentRatingText = useMemo(() => {
        const date = currentDate.toFormat("dd/MM")

        switch (currentPrices?.dayRating) {
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
    }, [currentPrices, currentDate, LL])

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
            setCurrentDate(date)
        }
    }

    return (
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
                    <Grid container spacing={3}>
                        {isToday && (
                            <Grid item xs={12} sm={6} md={3}>
                                <Metric
                                    label={LL.CURRENT_PRICE({
                                        currentTime:
                                            currentDate.toFormat("HH:mm"),
                                    })}
                                    value={currentPrice?.price ?? 0}
                                    delta={
                                        currentPrice
                                            ? median - currentPrice.price
                                            : 0
                                    }
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6} md={3}>
                            <Metric
                                label={LL.MIN_PRICE({
                                    minPrice: minPriceToday
                                        ? fromISO(
                                              minPriceToday.dateTime,
                                          ).toFormat("HH:mm")
                                        : "",
                                })}
                                value={minPriceToday ? minPriceToday.price : 0}
                                delta={
                                    median -
                                    (minPriceToday ? minPriceToday.price : 0)
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Metric
                                label={LL.MAX_PRICE({
                                    maxPrice: maxPriceToday
                                        ? fromISO(
                                              maxPriceToday.dateTime,
                                          ).toFormat("HH:mm")
                                        : "",
                                })}
                                value={maxPriceToday ? maxPriceToday.price : 0}
                                delta={
                                    median -
                                    (maxPriceToday ? maxPriceToday.price : 0)
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Metric
                                label={LL.THIRTY_DAY_AVG()}
                                value={median}
                            />
                        </Grid>
                    </Grid>
                </Container>

                <Container sx={{ p: 2, height: "400px" }}>
                    {currentPrices && (
                        <PriceChart
                            prices={currentPrices.prices}
                            median={median}
                            chartId="Today"
                            dateFormat="HH:mm"
                            showCurrentPrice={isToday}
                            cheapestPeriods={currentPrices.cheapestPeriods}
                            expensivePeriods={currentPrices.expensivePeriods}
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

                {minPriceTomorrow && maxPriceTomorrow && (
                    <Container sx={{ p: 2 }}>
                        <Grid container spacing={3} direction="row">
                            <Grid item xs={12} sm={6} md={3}>
                                <Metric
                                    label={LL.MIN_PRICE({
                                        minPrice: minPriceTomorrow
                                            ? fromISO(
                                                  minPriceTomorrow.dateTime,
                                              ).toFormat("HH:mm")
                                            : "",
                                    })}
                                    value={
                                        minPriceTomorrow
                                            ? minPriceTomorrow.price
                                            : 0
                                    }
                                    delta={
                                        median -
                                        (minPriceTomorrow
                                            ? minPriceTomorrow.price
                                            : 0)
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Metric
                                    label={LL.MAX_PRICE({
                                        maxPrice: maxPriceTomorrow
                                            ? fromISO(
                                                  maxPriceTomorrow.dateTime,
                                              ).toFormat("HH:mm")
                                            : "",
                                    })}
                                    value={
                                        maxPriceTomorrow
                                            ? maxPriceTomorrow.price
                                            : 0
                                    }
                                    delta={
                                        median -
                                        (maxPriceTomorrow
                                            ? maxPriceTomorrow.price
                                            : 0)
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Container>
                )}

                {pricesTomorrow && (
                    <Container sx={{ p: 2, height: "400px" }}>
                        <PriceChart
                            prices={pricesTomorrow.prices}
                            median={median}
                            chartId="Tomorrow"
                            dateFormat="HH:mm"
                            showCurrentPrice={true}
                            cheapestPeriods={pricesTomorrow.cheapestPeriods}
                            expensivePeriods={pricesTomorrow.expensivePeriods}
                        />
                    </Container>
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
                    <DailyMedianChart
                        medians={dailyMedians}
                        median={median}
                        chartId="DailyMedians"
                        dateFormat="MMM dd"
                    />
                </Container>
            </Paper>
        </Box>
    )
}

export default function Dashboard() {
    return <DashboardContent />
}
