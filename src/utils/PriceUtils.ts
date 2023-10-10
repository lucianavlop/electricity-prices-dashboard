import { Price } from "models/Price"

export const calculateAverage = (prices: Price[]): number => {
    return (
        prices.reduce((accumulator, price) => accumulator + price.price, 0) /
        prices.length
    )
}

// utils.ts
export const formatEuro = (amount: number): string => {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
    }).format(amount)
}

export const filterAndPadPrices = (
    period: Price[],
    now = new Date(),
): (number | null)[] => {
    if (period.length < 1) return []

    // If the period has passed return empty array
    const endOfPeriod = new Date(period[period.length - 1].dateTime)
    endOfPeriod.setMinutes(59)

    if (endOfPeriod.getTime() < now.getTime()) {
        return []
    }

    const paddedArray = Array.from({ length: 24 }, (_, i) => i)
        .map(priceHour => {
            return period.find(periodItem => {
                const hour = new Date(periodItem.dateTime).getHours()
                return hour === priceHour || hour + 1 === priceHour
            })
        })
        .map(price => (price ? price.price : null))

    // If the period ends at 23:00, duplicate the last item for 24:00
    if (endOfPeriod.getHours() === 23) {
        paddedArray.push(paddedArray[paddedArray.length - 1])
    }

    return paddedArray
}
