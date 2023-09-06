import type { BaseTranslation } from "../i18n-types"

const es = {
    TITLE: "Precios de la electricidad",
    TODAY_RATING: "Hoy {currentDate:string} es un día {rating:string}",
    CURRENT_PRICE: "Precio actual - {currentTime:string}",
    MIN_PRICE: "Precio min - {minPrice:string}",
    MAX_PRICE: "Precio max - {maxPrice:string}",
    THIRTY_DAY_AVG: "Precio promedio de 30 días",
    TOMORROW_RATING: "Mañana {currentDate:string} es un día {rating:string}",
    TOMORROW_NO_DATA:
        "Los datos de mañana aún no están disponibles. Los precios suelen estar disponibles después de las 20:30",
    LAST_THIRTY_DAYS: "Últimos 30 días",
    PRICE: "Precio",
} satisfies BaseTranslation

export default es
