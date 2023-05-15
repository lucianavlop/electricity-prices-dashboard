import axios from "axios"
import { format } from "date-fns"
import { Price } from "models/Price"

const PRICES_API = "https://elec-api.daithiapp.com/api/v1/price"

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
