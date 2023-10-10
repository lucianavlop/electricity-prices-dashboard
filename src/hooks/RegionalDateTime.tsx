import { DateTime } from "luxon"
import { useCallback } from "react"

const DEFAULT_TIMEZONE = "Europe/Madrid"

export const useDateTime = (timezone: string = DEFAULT_TIMEZONE) => {
    const now = useCallback(() => {
        return DateTime.local().setZone(timezone)
    }, [timezone])

    const fromISO = useCallback(
        (iso: string) => {
            return DateTime.fromISO(iso).setZone(timezone)
        },
        [timezone],
    )

    return {
        now,
        fromISO,
    }
}
