import { filterAndPadPrices } from "./PriceUtils"
import prices20230512 from "test/data/prices20230512.json"
import prices20230513 from "test/data/prices20230513.json"
import prices20230723 from "test/data/prices20230723.json"

describe("filterAndPadPrices", () => {
    test("should return empty array if prices is empty", () => {
        expect(filterAndPadPrices([])).toEqual([])
    })

    test("If the period has passed return null array", () => {
        expect(filterAndPadPrices(prices20230513)).toEqual([])
    })
})
