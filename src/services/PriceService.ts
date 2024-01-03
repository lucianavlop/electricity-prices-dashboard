import axios from "axios"
import { DateTime } from "luxon"
import { DailyPriceInfo } from "models/DailyPriceInfo"
import { DailyAverage } from "models/DailyAverage"

if (
    !process.env.REACT_APP_API_URL ||
    process.env.REACT_APP_API_URL.trim() === ""
) {
    throw new Error("REACT_APP_API_URL environment variable is not set")
}

const PRICES_API = process.env.REACT_APP_API_URL.trim()

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

export const getDailyAverages = async (
    date: DateTime,
): Promise<DailyAverage[] | null> => {
    const dateStr = date.toFormat("yyyy-MM-dd")

    try {
        const response = await axios.get<DailyAverage[]>(
            `${PRICES_API}/averages?date=${dateStr}`,
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
