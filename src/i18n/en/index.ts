import type { BaseTranslation } from "../i18n-types"

const en = {
    TITLE: "Electricity prices",
    TODAY_RATING: "Today {currentDate:string} is a {rating:string} day",
    CURRENT_PRICE: "Current price - {currentTime:string}",
    MIN_PRICE: "Min price - {minPrice:string}",
    MAX_PRICE: "Max price - {maxPrice:string}",
    THIRTY_DAY_AVG: "30 day average",
    TOMORROW_RATING: "Tomorrow {currentDate:string} is a {rating:string} day",
    TOMORROW_NO_DATA:
        "Tomorrow's prices are not available yet. Prices are usually available after 20:30",
    LAST_THIRTY_DAYS: "Last 30 days",
    PRICE: "Price",
} satisfies BaseTranslation

export default en
