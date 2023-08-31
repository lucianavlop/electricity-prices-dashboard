import axios from "axios"
import { format } from "date-fns"
import { DailyPriceInfo } from "models/DailyPriceInfo"
import { Price } from "models/Price"

const PRICES_API = "https://elec-prices-9603b16ade4e.herokuapp.com/api/v1/price"

export const getPrices = async (start: Date, end: Date): Promise<Price[]> => {
    const start_day = format(start, "yyyy-MM-dd")
    const end_day = format(end, "yyyy-MM-dd")

    const response = await axios.get<Price[]>(
        `${PRICES_API}?start=${start_day}&end=${end_day}`,
    )
    return response.data
}

export const getDailyPriceInfo = async (
    date: Date,
): Promise<DailyPriceInfo> => {
    const dateStr = format(date, "yyyy-MM-dd")
    const response = await axios.get<DailyPriceInfo>(
        `${PRICES_API}/dailyinfo/${dateStr}`,
    )
    return response.data
}
