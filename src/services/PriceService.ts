import axios from "axios"
import { DateTime } from "luxon"
import { DailyPriceInfo } from "models/DailyPriceInfo"
import { Price } from "models/Price"

// const PRICES_API = "https://elec-prices-9603b16ade4e.herokuapp.com/api/v1/price"
const PRICES_API = "https://elec-api.daithiapp.com/api/v1/price"

export const getPrices = async (
    start: DateTime,
    end: DateTime,
): Promise<Price[]> => {
    const start_day = start.toFormat("yyyy-MM-dd")
    const end_day = end.toFormat("yyyy-MM-dd")

    const response = await axios.get<Price[]>(
        `${PRICES_API}?start=${start_day}&end=${end_day}`,
    )
    return response.data
}

export const getDailyPriceInfo = async (
    date: DateTime,
): Promise<DailyPriceInfo> => {
    const dateStr = date.toFormat("yyyy-MM-dd")

    const response = await axios.get<DailyPriceInfo>(
        `${PRICES_API}/dailyinfo/${dateStr}`,
    )
    return response.data
}
