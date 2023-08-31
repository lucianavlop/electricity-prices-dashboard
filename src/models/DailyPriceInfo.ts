import { DayRating } from "./DayRating"
import { Price } from "./Price"

export interface Pair<T> {
    first: T
    second: T
}

export interface DailyPriceInfo {
    dayRating: DayRating
    prices: Price[]
    cheapestPeriods: Pair<Price[]>
    expensivePeriod: Price[]
}
