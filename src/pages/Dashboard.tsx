import React, { useEffect, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import DailyChart from "components/PriceChart"
import { DateTime } from "luxon"
import { Price } from "models/Price"
import { getDailyPriceInfo, getPrices } from "services/PriceService"
import { calculateAverage } from "utils/PriceUtils"
import { Container, Grid } from "@mui/material"
import Metric from "components/Metric"
import { DailyPriceInfo } from "models/DailyPriceInfo"
import { DayRating } from "models/DayRating"
import { useI18nContext } from "i18n/i18n-react"

const DashboardContent: React.FC = () => {
    const { LL } = useI18nContext()
    const [currentDate, setCurrentDate] = useState(
        DateTime.now().setZone("Europe/Madrid"),
    )
    const [pricesToday, setPricesToday] = useState<DailyPriceInfo | null>(null)
    const [pricesTomorrow, setPricesTomorrow] = useState<DailyPriceInfo | null>(
        null,
    )
    const [pricesThirtyDays, setPricesThirtyDays] = useState<Price[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const prices = await getDailyPriceInfo(currentDate)
            if (prices.prices.length === 0) return
            setPricesToday(prices)
        }
        fetchData()
    }, [currentDate])

    useEffect(() => {
        const fetchData = async () => {
            const tomorrow = currentDate.plus({ days: 1 })

            const prices = await getDailyPriceInfo(tomorrow)
            if (prices.prices.length === 0) {
                setPricesTomorrow(null)
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
    }, [currentDate])

    useEffect(() => {
        const fetchData = async () => {
            const thirtyDaysAgo = currentDate.minus({ days: 30 })

            const prices = await getPrices(thirtyDaysAgo, currentDate)

            setPricesThirtyDays(prices)
        }
        fetchData()
    }, [currentDate])

    useEffect(() => {
        // Set date to 3 days ago
        const fetchData = () =>
            setCurrentDate(DateTime.now().setZone("Europe/Madrid"))
        // Calculate time remaining until the start of the next hour
        const now = DateTime.now().setZone("Europe/Madrid")
        const nextHour = now.startOf("hour").plus({ hour: 1 })
        const millisecondsUntilNextHour = nextHour.diff(
            now,
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
    }, [])

    const median = useMemo(
        () => calculateAverage(pricesThirtyDays),
        [pricesThirtyDays],
    )

    const currentPrice = useMemo(() => {
        return (
            pricesToday?.prices.find(price => {
                const priceDateTimeInMadrid = DateTime.fromISO(
                    price.dateTime,
                ).setZone("Europe/Madrid")

                return currentDate.hasSame(priceDateTimeInMadrid, "hour")
            }) ?? null
        )
    }, [pricesToday, currentDate])

    const minPriceToday = useMemo(() => {
        if (!pricesToday) return null
        const min = Math.min(...pricesToday.prices.map(price => price.price))
        return pricesToday.prices.find(price => price.price === min)
    }, [pricesToday])

    const maxPriceToday = useMemo(() => {
        if (!pricesToday) return null
        const max = Math.max(...pricesToday.prices.map(price => price.price))
        return pricesToday.prices.find(price => price.price === max)
    }, [pricesToday])

    const minPriceTomorrow = useMemo(() => {
        if (!pricesTomorrow) return null
        const min = Math.min(...pricesTomorrow.prices.map(price => price.price))
        return pricesTomorrow.prices.find(price => price.price === min)
    }, [pricesTomorrow])

    const maxPriceTomorrow = useMemo(() => {
        if (!pricesTomorrow) return null
        const max = Math.max(...pricesTomorrow.prices.map(price => price.price))
        return pricesTomorrow.prices.find(price => price.price === max)
    }, [pricesTomorrow])

    const dailyMedians = useMemo(() => {
        const medians: Price[] = []

        if (pricesThirtyDays.length % 24 !== 0)
            throw Error(
                `Expected prices to be a multiple of 24 but got ${pricesThirtyDays.length}`,
            )

        for (let i = 0; i < pricesThirtyDays.length; i = i + 24) {
            const prices = pricesThirtyDays.slice(i, i + 24)
            const median = calculateAverage(prices)
            medians.push({ price: median, dateTime: prices[0].dateTime })
        }

        return medians
    }, [pricesThirtyDays])

    const todayRating = useMemo(() => {
        switch (pricesToday?.dayRating) {
            case DayRating.BAD:
                return "MALO"
            case DayRating.GOOD:
                return "BUENO"
            default:
                return "NORMAL"
        }
    }, [pricesToday])

    const tomorrowRating = useMemo(() => {
        switch (pricesTomorrow?.dayRating) {
            case DayRating.BAD:
                return "MALO"
            case DayRating.GOOD:
                return "BUENO"
            default:
                return "NORMAL"
        }
    }, [pricesTomorrow])

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

                    <Typography
                        variant="h2"
                        component="h2"
                        align="left"
                        gutterBottom>
                        {LL.TODAY_RATING({
                            currentDate: currentDate
                                .setZone("Europe/Madrid")
                                .toFormat("dd/MM"),
                            rating: todayRating,
                        })}
                    </Typography>
                </Container>

                <Container sx={{ p: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Metric
                                label={LL.CURRENT_PRICE({
                                    currentTime: currentDate
                                        .setZone("Europe/Madrid")
                                        .toFormat("HH:mm"),
                                })}
                                value={currentPrice?.price ?? 0}
                                delta={
                                    currentPrice
                                        ? median - currentPrice.price
                                        : 0
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Metric
                                label={LL.MIN_PRICE({
                                    minPrice: minPriceToday
                                        ? DateTime.fromISO(
                                              minPriceToday.dateTime,
                                          )
                                              .setZone("Europe/Madrid")
                                              .toFormat("HH:mm")
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
                                        ? DateTime.fromISO(
                                              maxPriceToday.dateTime,
                                          )
                                              .setZone("Europe/Madrid")
                                              .toFormat("HH:mm")
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
                    {pricesToday && (
                        <DailyChart
                            prices={pricesToday.prices}
                            median={median}
                            chartId="Today"
                            dateFormat="HH:mm"
                            showCurrentPrice={true}
                            cheapestPeriods={pricesToday.cheapestPeriods}
                            expensivePeriod={pricesToday.expensivePeriod}
                        />
                    )}
                </Container>

                <Container sx={{ p: 2 }}>
                    <Typography
                        variant="h2"
                        component="h2"
                        align="left"
                        gutterBottom>
                        {pricesTomorrow && pricesTomorrow.prices.length > 0
                            ? LL.TOMORROW_RATING({
                                  currentDate: DateTime.fromISO(
                                      pricesTomorrow.prices[0].dateTime,
                                  )
                                      .setZone("Europe/Madrid")
                                      .toFormat("dd/MM"),
                                  rating: tomorrowRating,
                              })
                            : LL.TOMORROW_NO_DATA()}
                    </Typography>
                </Container>

                {minPriceTomorrow && maxPriceTomorrow && (
                    <Container sx={{ p: 2 }}>
                        <Grid container spacing={3} direction="row">
                            <Grid item xs={12} sm={6} md={3}>
                                <Metric
                                    label={LL.MIN_PRICE({
                                        minPrice: minPriceTomorrow
                                            ? DateTime.fromISO(
                                                  minPriceTomorrow.dateTime,
                                              )
                                                  .setZone("Europe/Madrid")
                                                  .toFormat("HH:mm")
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
                                            ? DateTime.fromISO(
                                                  maxPriceTomorrow.dateTime,
                                              )
                                                  .setZone("Europe/Madrid")
                                                  .toFormat("HH:mm")
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
                        <DailyChart
                            prices={pricesTomorrow.prices}
                            median={median}
                            chartId="Tomorrow"
                            dateFormat="HH:mm"
                            showCurrentPrice={true}
                            cheapestPeriods={pricesTomorrow.cheapestPeriods}
                            expensivePeriod={pricesTomorrow.expensivePeriod}
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
                    <DailyChart
                        prices={dailyMedians}
                        median={median}
                        chartId="DailyMedians"
                        dateFormat="MMM dd"
                        showCurrentPrice={false}
                        cheapestPeriods={{ first: [], second: [] }}
                        expensivePeriod={[]}
                    />
                </Container>
            </Paper>
        </Box>
    )
}

export default function Dashboard() {
    return <DashboardContent />
}
