import { Price } from "models/Price"

const VARIANCE = 0.02

export type DayRating = "BUENO" | "NORMAL" | "MALO"

const sortPricesByDate = (prices: Price[]): Price[] => {
    return prices.sort(
        (a, b) =>
            new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    )
}

export const getCheapestPeriod = (prices: Price[], n: number): Price[] => {
    if (prices.length < n) return []

    const prices_sorted = sortPricesByDate(prices)

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

export const getTwoCheapestPeriods = (
    prices: Price[],
    n: number,
): Price[][] => {
    if (prices.length < n) return [[], []]

    let firstPeriod = getCheapestPeriod(prices, n)

    const remainingPricesBefore = prices.filter(
        p =>
            new Date(p.dateTime).getTime() <
            new Date(firstPeriod[0].dateTime).getTime(),
    )

    const remainingPricesAfter = prices.filter(
        p =>
            new Date(p.dateTime).getTime() >
            new Date(firstPeriod[n - 1].dateTime).getTime(),
    )

    const firstPeriodBefore = getCheapestPeriod(remainingPricesBefore, n)
    const firstPeriodAfter = getCheapestPeriod(remainingPricesAfter, n)

    let secondPeriod: Price[] = []

    if (firstPeriodBefore.length === n && firstPeriodAfter.length === n) {
        const firstPeriodBeforeAverage = calculateAverage(firstPeriodBefore)
        const firstPeriodAfterAverage = calculateAverage(firstPeriodAfter)

        secondPeriod =
            firstPeriodBeforeAverage < firstPeriodAfterAverage
                ? firstPeriodBefore
                : firstPeriodAfter
    } else {
        secondPeriod =
            firstPeriodBefore.length === n
                ? firstPeriodBefore
                : firstPeriodAfter
    }

    // Only show the second period if it is in the future and the average is within the variance of the first period
    if (
        Math.abs(
            calculateAverage(firstPeriod) - calculateAverage(secondPeriod),
        ) > VARIANCE
    ) {
        secondPeriod = []
    }

    return [firstPeriod, secondPeriod]
}

export const getMostExpensivePeriod = (prices: Price[], n: number): Price[] => {
    if (prices.length < n) return []

    const prices_sorted = sortPricesByDate(prices)

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
