import type { Translation } from "../i18n-types"

const es = {
    TITLE: "Precios de la electricidad",
    TODAY_RATING: "Hoy {currentDate} es un día {rating}",
    CURRENT_PRICE: "Precio actual - {currentTime}",
    MIN_PRICE: "Precio min - {minPrice}",
    MAX_PRICE: "Precio max - {maxPrice}",
    THIRTY_DAY_AVG: "Precio promedio de 30 días",
    TOMORROW_RATING: "Mañana {currentDate} es un día {rating}",
    TOMORROW_NO_DATA:
        "Los datos de mañana aún no están disponibles. Los precios suelen estar disponibles después de las 20:30",
    LAST_THIRTY_DAYS: "Últimos 30 días",
    PRICE: "Precio",
} satisfies Translation

export default es
