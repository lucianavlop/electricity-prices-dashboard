import { padPrices } from "./PriceUtils"
import prices20230513 from "test/data/prices20230513.json"

describe("padPrices", () => {
    test("should return empty array if prices is empty", () => {
        expect(padPrices([])).toEqual([])
    })

    test("If the period has passed return null array", () => {
        expect(padPrices(prices20230513)).toEqual([])
    })
})
