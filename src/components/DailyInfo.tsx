import { Grid } from "@mui/material"
import Metric from "./Metric"
import { useI18nContext } from "i18n/i18n-react"
import { useDateTime } from "hooks/RegionalDateTime"
import { useMemo } from "react"
import { DailyPriceInfo } from "models/DailyPriceInfo"

export interface DailyInfoProps {
    dailyInfo: DailyPriceInfo
    thirtyDayAverage: number
}

const DailyInfo: React.FC<DailyInfoProps> = ({
    dailyInfo,
    thirtyDayAverage,
}) => {
    const { LL } = useI18nContext()
    const { now, fromISO } = useDateTime()

    const isToday = useMemo(() => {
        if (dailyInfo.prices.length === 0) return false
        const currentDate = fromISO(dailyInfo.prices[0].dateTime)
        return currentDate.hasSame(now(), "day")
    }, [dailyInfo.prices, fromISO, now])

    const currentPrice = useMemo(() => {
        if (!isToday) return null
        const currentDate = now()
        return (
            dailyInfo.prices.find(price => {
                const priceDateTimeInMadrid = fromISO(price.dateTime)

                return currentDate.hasSame(priceDateTimeInMadrid, "hour")
            }) ?? null
        )
    }, [dailyInfo.prices, fromISO, isToday, now])

    const minPrice = useMemo(() => {
        if (dailyInfo.prices.length === 0) return null
        const min = Math.min(...dailyInfo.prices.map(price => price.price))
        return dailyInfo.prices.find(price => price.price === min) ?? null
    }, [dailyInfo.prices])

    const maxPrice = useMemo(() => {
        if (dailyInfo.prices.length === 0) return null
        const max = Math.max(...dailyInfo.prices.map(price => price.price))
        return dailyInfo.prices.find(price => price.price === max) ?? null
    }, [dailyInfo.prices])

    return (
        <Grid container spacing={3}>
            {currentPrice && (
                <Grid item xs={12} sm={6} md={3}>
                    <Metric
                        label={LL.CURRENT_PRICE({
                            currentTime: fromISO(
                                currentPrice.dateTime,
                            ).toFormat("HH:mm"),
                        })}
                        value={currentPrice.price}
                        delta={
                            currentPrice
                                ? thirtyDayAverage - currentPrice.price
                                : 0
                        }
                    />
                </Grid>
            )}

            <Grid item xs={12} sm={6} md={3}>
                {minPrice && (
                    <Metric
                        label={LL.MIN_PRICE({
                            minPrice: minPrice
                                ? fromISO(minPrice.dateTime).toFormat("HH:mm")
                                : "",
                        })}
                        value={minPrice ? minPrice.price : 0}
                        delta={thirtyDayAverage - minPrice.price}
                    />
                )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                {maxPrice && (
                    <Metric
                        label={LL.MAX_PRICE({
                            maxPrice: maxPrice
                                ? fromISO(maxPrice.dateTime).toFormat("HH:mm")
                                : "",
                        })}
                        value={maxPrice ? maxPrice.price : 0}
                        delta={
                            thirtyDayAverage - (maxPrice ? maxPrice.price : 0)
                        }
                    />
                )}
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                {thirtyDayAverage && (
                    <Metric
                        label={LL.THIRTY_DAY_AVG()}
                        value={thirtyDayAverage}
                    />
                )}
            </Grid>
        </Grid>
    )
}

export default DailyInfo
