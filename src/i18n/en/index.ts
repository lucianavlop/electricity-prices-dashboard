import type { Translation } from "../i18n-types"

const en = {
    TITLE: "Electricity prices",
    TODAY_RATING: "Today {currentDate} is a {rating} day",
    CURRENT_PRICE: "Current price - {currentTime}",
    MIN_PRICE: "Min price - {minPrice}",
    MAX_PRICE: "Max price - {maxPrice}",
    THIRTY_DAY_AVG: "30 day average",
    TOMORROW_RATING: "Tomorrow {currentDate} is a {rating} day",
    TOMORROW_NO_DATA:
        "Tomorrow's prices are not available yet. Prices are usually available after 20:30",
    LAST_THIRTY_DAYS: "Last 30 days",
    PRICE: "Price",
} satisfies Translation

export default en
