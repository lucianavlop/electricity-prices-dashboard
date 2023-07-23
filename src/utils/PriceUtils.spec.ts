import {
    getCheapestPeriod,
    getTwoCheapestPeriods,
    getMostExpensivePeriod,
    filterAndPadPrices,
} from "./PriceUtils"
import prices20230512 from "test/data/prices20230512.json"
import prices20230513 from "test/data/prices20230513.json"
import prices20230723 from "test/data/prices20230723.json"

describe("getCheapestPeriod", () => {
    test("should return empty array if prices is empty", () => {
        expect(getCheapestPeriod([], 3)).toEqual([])
    })

    test("should return empty array if prices is smaller than n", () => {
        expect(
            getCheapestPeriod(
                [
                    {
                        dateTime: "2021-01-01T00:00:00",
                        price: 1,
                    },
                ],
                3,
            ),
        ).toEqual([])
    })

    test("should return the cheapest period", () => {
        expect(getCheapestPeriod(prices20230513, 3)).toEqual([
            {
                id: "bdb87b7cea79b91f1c3b8c8b07790f52",
                dateTime: "2023-05-13T12:00:00",
                price: 0.032979999999999995,
            },
            {
                id: "d967f370e156eecf15eb74f7f19a003b",
                dateTime: "2023-05-13T13:00:00",
                price: 0.03258,
            },
            {
                id: "f42c091e495f0a505e1d74d33adeda5e",
                dateTime: "2023-05-13T14:00:00",
                price: 0.032240000000000005,
            },
        ])
    })

    test("should return the cheapest period when n is 1", () => {
        expect(getCheapestPeriod(prices20230513, 1)).toEqual([
            {
                id: "f42c091e495f0a505e1d74d33adeda5e",
                dateTime: "2023-05-13T14:00:00",
                price: 0.032240000000000005,
            },
        ])
    })

    test("should return the cheapest period when n is 24", () => {
        expect(getCheapestPeriod(prices20230513, 24)).toEqual(prices20230513)
    })
})

describe("getTwoCheapestPeriods", () => {
    test("should return empty array if prices is empty", () => {
        expect(getTwoCheapestPeriods([], 3)).toEqual([[], []])
    })

    test("should return empty array if prices is smaller than n", () => {
        expect(
            getTwoCheapestPeriods(
                [
                    {
                        dateTime: "2021-01-01T00:00:00",
                        price: 1,
                    },
                ],
                3,
            ),
        ).toEqual([[], []])
    })

    test("should return the two cheapest periods 2023-05-12", () => {
        expect(getTwoCheapestPeriods(prices20230512, 3)).toEqual([
            [
                {
                    id: "ae993073443a1bb44d5d8d5f7f9bb325",
                    dateTime: "2023-05-12T15:00:00",
                    price: 0.08502,
                },
                {
                    id: "c70f72673a5969afa7e346c8ccadfe51",
                    dateTime: "2023-05-12T16:00:00",
                    price: 0.05947,
                },
                {
                    id: "87dc0bd4efd7f496d63bb23fe743bd38",
                    dateTime: "2023-05-12T17:00:00",
                    price: 0.06605,
                },
            ],
            [],
        ])
    })

    test("should return the two cheapest periods 2023-05-13", () => {
        expect(getTwoCheapestPeriods(prices20230513, 3)).toEqual([
            [
                {
                    id: "bdb87b7cea79b91f1c3b8c8b07790f52",
                    dateTime: "2023-05-13T12:00:00",
                    price: 0.032979999999999995,
                },
                {
                    id: "d967f370e156eecf15eb74f7f19a003b",
                    dateTime: "2023-05-13T13:00:00",
                    price: 0.03258,
                },
                {
                    id: "f42c091e495f0a505e1d74d33adeda5e",
                    dateTime: "2023-05-13T14:00:00",
                    price: 0.032240000000000005,
                },
            ],
            [
                {
                    id: "3a6127f54bafd29e4b775e2e0e703c19",
                    dateTime: "2023-05-13T15:00:00",
                    price: 0.03533,
                },
                {
                    id: "370521bc0f501b5ac3a5969c35ecbabc",
                    dateTime: "2023-05-13T16:00:00",
                    price: 0.03728,
                },
                {
                    id: "13c8a4ab57274db4fa9f7f05ce77a947",
                    dateTime: "2023-05-13T17:00:00",
                    price: 0.038869999999999995,
                },
            ],
        ])
    })
})

describe("getMostExpensivePeriod", () => {
    test("should return empty array if prices is empty", () => {
        expect(getMostExpensivePeriod([], 3)).toEqual([])
    })

    test("should return empty array if prices is smaller than n", () => {
        expect(
            getMostExpensivePeriod(
                [
                    {
                        dateTime: "2023-05-13T01:00:00",
                        price: 1,
                    },
                ],
                3,
            ),
        ).toEqual([])
    })

    test("should return the most expensive period", () => {
        expect(getMostExpensivePeriod(prices20230513, 3)).toEqual([
            {
                id: "3bdc0728eb8cc5665b767c206b2dc82d",
                dateTime: "2023-05-13T21:00:00",
                price: 0.14053,
            },
            {
                id: "88bfd766c37939aad7360972af3707f9",
                dateTime: "2023-05-13T22:00:00",
                price: 0.13826,
            },
            {
                id: "7085e6975e811d4c06a33c443fafe05d",
                dateTime: "2023-05-13T23:00:00",
                price: 0.1333,
            },
        ])
    })

    test("Expensive period straddles midnight", () => {
        expect(getMostExpensivePeriod(prices20230723, 3)).toEqual([
            {
                "id": "b14a7bf97c418986c5af55ad79b157f1",
                "dateTime": "2023-07-23T21:00:00",
                "price": 0.14206
            },
            {
                "id": "b2bccb7fb13ae214973eb4909e353c1f",
                "dateTime": "2023-07-23T22:00:00",
                "price": 0.157
            },
            {
                "id": "83d26efb860b6bff36b06481189983f9",
                "dateTime": "2023-07-23T23:00:00",
                "price": 0.15965000000000001
            }])
        })
})

describe("filterAndPadPrices", () => {
    test("should return empty array if prices is empty", () => {
        expect(filterAndPadPrices([])).toEqual([])
    })

    test("If the period has passed return null array", () => {
        expect(filterAndPadPrices(prices20230513)).toEqual([])
    })

})
