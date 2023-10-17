import axios from "axios"
import { DateTime } from "luxon"
import { DailyPriceInfo } from "models/DailyPriceInfo"
import { Price } from "models/Price"

// const PRICES_API = "https://elec-prices-9603b16ade4e.herokuapp.com/api/v1/price"
const PRICES_API = "http://localhost:8080/api/v1/price"

export const getPrices = async (
    start: DateTime,
    end: DateTime,
): Promise<Price[]> => {
    const startDay = start.toFormat("yyyy-MM-dd")
    const endDay = end.toFormat("yyyy-MM-dd")

    const response = await axios.get<Price[]>(
        `${PRICES_API}?start=${startDay}&end=${endDay}`,
    )
    return response.data
}

export const getDailyPriceInfo = async (
    date: DateTime,
): Promise<DailyPriceInfo | null> => {
    const dateStr = date.toFormat("yyyy-MM-dd")

    try {
        const response = await axios.get<DailyPriceInfo>(
            `${PRICES_API}/dailyinfo?date=${dateStr}`,
        )
        return response.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                console.error("Resource not found.")
            } else {
                console.error(`An error occurred: ${error.response?.status}`)
            }
        } else {
            console.error("An unknown error occurred.")
        }
        return null
    }
}
