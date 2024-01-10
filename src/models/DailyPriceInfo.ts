import { DayRating } from "./DayRating"
import { Price } from "./Price"

export interface DailyPriceInfo {
    dayRating: DayRating
    prices: Price[]
    cheapestPeriods: Price[][]
    expensivePeriods: Price[][]
}
