import type { BaseTranslation } from "../i18n-types"

const es = {
    TITLE: "Precios de la electricidad",
    TODAY_RATING_GOOD: "Hoy {currentDate:string} es un día BUENO",
    TODAY_RATING_BAD: "Hoy {currentDate:string} es un día MALO",
    TODAY_RATING_NORMAL: "Hoy {currentDate:string} es un día NORMAL",
    CURRENT_PRICE: "Precio actual - {currentTime:string}",
    MIN_PRICE: "Precio min - {minPrice:string}",
    MAX_PRICE: "Precio max - {maxPrice:string}",
    THIRTY_DAY_AVG: "Precio promedio de 30 días",
    TOMORROW_RATING_GOOD: "Mañana {currentDate:string} es un día BUENO",
    TOMORROW_RATING_BAD: "Mañana {currentDate:string} es un día MALO",
    TOMORROW_RATING_NORMAL: "Mañana {currentDate:string} es un día NORMAL",
    TOMORROW_NO_DATA:
        "Los datos de mañana aún no están disponibles. Los precios suelen estar disponibles después de las 20:30",
    LAST_THIRTY_DAYS: "Últimos 30 días",
    PRICE: "Precio",
} satisfies BaseTranslation

export default es