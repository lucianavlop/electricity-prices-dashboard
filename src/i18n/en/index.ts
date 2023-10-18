import type { Translation } from "../i18n-types"

const en = {
    TITLE: "Electricity prices",
    CURRENT_RATING_GOOD: "{currentDate} is a GOOD day",
    CURRENT_RATING_BAD: "{currentDate} is a BAD day",
    CURRENT_RATING_NORMAL: "{currentDate} is a NORMAL day",
    CURRENT_PRICE: "Current price - {currentTime}",
    MIN_PRICE: "Min price - {minPrice}",
    MAX_PRICE: "Max price - {maxPrice}",
    THIRTY_DAY_AVG: "30 day average",
    TOMORROW_RATING_GOOD: "Tomorrow {currentDate} is a GOOD day",
    TOMORROW_RATING_BAD: "Tomorrow {currentDate} is a BAD day",
    TOMORROW_RATING_NORMAL: "Tomorrow {currentDate} is a NORMAL day",
    TOMORROW_NO_DATA:
        "Tomorrow's prices are not available yet. Prices are usually available after 20:30",
    LAST_THIRTY_DAYS: "Last 30 days",
    PRICE: "Price",
} satisfies Translation

export default en
