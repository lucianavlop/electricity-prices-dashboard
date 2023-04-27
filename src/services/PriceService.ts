import axios from "axios"
import { format } from "date-fns"
import { Price } from "models/Price"

const PRICES_API = "https://elec-api.daithiapp.com/api/v1/price"
const VARIANCE = 0.02

export type DayRating = "BUENO" | "NORMAL" | "MALO"

export const getPricesXDaysAgo = async (x: number): Promise<Price[]> => {
    const today = new Date()
    const xDaysAgo = new Date()
    xDaysAgo.setTime(today.getTime() - x * 24 * 60 * 60 * 1000)
    return getPrices(xDaysAgo, xDaysAgo)
}

export const getPrices = async (start: Date, end: Date): Promise<Price[]> => {
    const start_day = format(start, "yyyy-MM-dd")
    const end_day = format(end, "yyyy-MM-dd")

    const response = await axios.get<Price[]>(
        `${PRICES_API}?start=${start_day}&end=${end_day}`,
    )
    return response.data
}

export const getCheapestPeriod = (prices: Price[], n: number): Price[] => {
    const prices_sorted = prices.sort(
        (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    )

    let min_sum = Number.POSITIVE_INFINITY
    let min_window: Price[] = []

    for (let i = 0; i <= prices_sorted.length - n; i++) {
        const window_sum = prices_sorted
            .slice(i, i + n)
            .reduce((sum, p) => sum + p.price, 0)
        if (window_sum < min_sum) {
            min_sum = window_sum
            min_window = prices_sorted.slice(i, i + n)
        }
    }

    return min_window
}

export const getMostExpensivePeriod = (prices: Price[], n: number): Price[] => {
    const prices_sorted = prices.sort(
        (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    )

    let max_sum = Number.NEGATIVE_INFINITY
    let max_window: Price[] = []

    for (let i = 0; i <= prices_sorted.length - n; i++) {
        const window_sum = prices_sorted
            .slice(i, i + n)
            .reduce((sum, p) => sum + p.price, 0)
        if (window_sum > max_sum) {
            max_sum = window_sum
            max_window = prices_sorted.slice(i, i + n)
        }
    }

    return max_window
}

export const calculateAverage = (prices: Price[]): number => {
    return (
        prices.reduce((accumulator, price) => accumulator + price.price, 0) /
        prices.length
    )
}

export const calculateRating = (prices: Price[], median: number): DayRating => {
    const currMedian = calculateAverage(prices)
    const lowLine = median - VARIANCE
    const highLine = median + VARIANCE

    if (currMedian < lowLine) {
        return "BUENO"
    } else if (currMedian >= lowLine && currMedian <= highLine) {
        return "NORMAL"
    } else {
        return "MALO"
    }
}

// utils.ts
export const formatEuro = (amount: number): string => {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
    }).format(amount)
}
