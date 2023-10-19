import React, { useEffect, useMemo, useRef, useState } from "react"
import { Chart, ChartData, ChartOptions } from "chart.js/auto"
import Annotation, { LineAnnotationOptions } from "chartjs-plugin-annotation"
import { Price } from "models/Price"
import { useTheme } from "@mui/material/styles"
import { padPrices } from "utils/PriceUtils"
import { useI18nContext } from "i18n/i18n-react"
import { useDateTime } from "hooks/RegionalDateTime"

Chart.register(Annotation)

export const ID_PREFIX = "daily-chart-"

const hexToRGBA = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export interface PriceChartProps {
    prices: Price[]
    median: number
    chartId: string
    dateFormat: string
    showCurrentPrice: boolean
    cheapestPeriods: Price[][]
    expensivePeriods: Price[][]
}

const PriceChart: React.FC<PriceChartProps> = ({
    prices,
    median,
    chartId,
    dateFormat,
    showCurrentPrice,
    cheapestPeriods,
    expensivePeriods,
}) => {
    const { LL } = useI18nContext()
    const { now, fromISO } = useDateTime()
    const theme = useTheme()
    const [currentPriceLocation, setCurrentPriceLocation] = useState(-1)
    const chartRef = useRef<Chart | null>(null)

    useEffect(() => {
        if (!showCurrentPrice || prices.length <= 1) return
        // Function to be executed every minute
        const updateData = () => {
            if (!showCurrentPrice || prices.length <= 1) return

            const canvasWidth = prices.length - 1

            // Use Luxon's DateTime objects with Europe/Madrid timezone
            const startTime = fromISO(prices[0].dateTime).toMillis()
            const endTime = fromISO(
                prices[prices.length - 1].dateTime,
            ).toMillis()
            const currentTime = now().toMillis()

            if (currentTime < startTime || currentTime > endTime)
                return setCurrentPriceLocation(-1)

            setCurrentPriceLocation(
                ((currentTime - startTime) / (endTime - startTime)) *
                    canvasWidth,
            )
        }

        // Run the function on component load
        updateData()

        // Set the interval to run the function every minute
        const intervalId = setInterval(updateData, 10 * 60 * 1000)

        // Cleanup function to clear the interval when the component is unmounted
        return () => {
            clearInterval(intervalId)
        }
    }, [fromISO, now, prices, showCurrentPrice])

    const chartOptions = useMemo(() => {
        const chartOptions: ChartOptions = {
            plugins: {
                annotation: {
                    annotations: [
                        {
                            type: "line",
                            xScaleID: "x",
                            xMin: currentPriceLocation, // The x-axis value where the vertical line should be drawn
                            xMax: currentPriceLocation,
                            borderColor:
                                theme.palette.mode === "dark"
                                    ? theme.palette.grey[300]
                                    : theme.palette.grey[800],
                            borderWidth: 4,
                            display: currentPriceLocation !== -1,
                        } as LineAnnotationOptions,
                    ],
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            if (
                                !context.dataset.label ||
                                context.dataset.label === "Hide"
                            )
                                return ""

                            return `${context.dataset.label}: ${context.formattedValue}`
                        },
                    },
                },
                legend: {
                    position: "bottom",
                    labels: {
                        filter: item => {
                            return item.text !== "Hide" // Hide the label for 'Dataset 2'
                        },
                        color:
                            theme.palette.mode === "dark"
                                ? theme.palette.grey[300]
                                : theme.palette.grey[800],
                    },
                },
            },
            interaction: {
                intersect: false,
                mode: "index",
            },
            elements: {
                line: {
                    tension: 0.2, // disables bezier curves
                    // stepped: true, // use steppedLine to create a stepped line chart
                },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false, // Set this to false to remove vertical grid lines
                        // color: theme.palette.divider,
                    },
                    ticks: {
                        color:
                            theme.palette.mode === "dark"
                                ? theme.palette.grey[300]
                                : theme.palette.grey[800],
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: theme.palette.divider,
                    },
                    ticks: {
                        color:
                            theme.palette.mode === "dark"
                                ? theme.palette.grey[300]
                                : theme.palette.grey[800],
                    },
                },
            },
        }
        return chartOptions
    }, [currentPriceLocation, theme])

    const cheapestPeriodsPadded = useMemo(
        () => cheapestPeriods.map(period => padPrices(period)),
        [cheapestPeriods],
    )

    const expensivePeriodsPadded = useMemo(
        () => expensivePeriods.map(period => padPrices(period)),

        [expensivePeriods],
    )

    const paddedPrices = useMemo(() => {
        if (prices.length === 0) return []
        const last = prices[prices.length - 1]
        const pp = [...prices]
        pp.push({
            price: last.price,
            dateTime: last.dateTime.slice(0, -8) + "24:00:00",
        })
        return pp
    }, [prices])

    const averageDataset = useMemo(
        () => Array<number>(paddedPrices.length).fill(median),
        [paddedPrices, median],
    )

    const chartData: ChartData<"line", (number | null)[]> = useMemo(() => {
        const datasets = []

        cheapestPeriodsPadded.forEach((period, index) => {
            datasets.push(
                {
                    label: "Hide",
                    data: period,
                    backgroundColor: hexToRGBA(theme.palette.success.main, 0.2),
                    showLine: false,
                    fill: "start",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: period,
                    backgroundColor: hexToRGBA(theme.palette.success.main, 0.2),
                    showLine: false,
                    fill: "end",
                    pointRadius: 0,
                },
            )
        })

        expensivePeriodsPadded.forEach((period, index) => {
            datasets.push(
                {
                    label: "Hide",
                    data: period,
                    backgroundColor: hexToRGBA(theme.palette.error.main, 0.2),
                    showLine: false,
                    fill: "start",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: period,
                    backgroundColor: hexToRGBA(theme.palette.error.main, 0.2),
                    showLine: false,
                    fill: "end",
                    pointRadius: 0,
                },
            )
        })

        datasets.push(
            {
                label: LL.PRICE(),
                data: paddedPrices.map(item => item.price),
                borderColor: theme.palette.info.main,
                backgroundColor: hexToRGBA(theme.palette.info.main, 0.4),
                pointRadius: 0,
            },
            {
                label: LL.THIRTY_DAY_AVG(),
                data: averageDataset,
                borderColor: theme.palette.secondary.main,
                backgroundColor: hexToRGBA(theme.palette.secondary.main, 0.2),
                pointRadius: 0,
            },
        )

        return {
            labels: paddedPrices.map(item =>
                fromISO(item.dateTime).toFormat(dateFormat),
            ),
            datasets: datasets,
        }
    }, [
        paddedPrices,
        cheapestPeriodsPadded,
        theme.palette.success.main,
        theme.palette.error.main,
        theme.palette.info.main,
        theme.palette.secondary.main,
        expensivePeriodsPadded,
        LL,
        averageDataset,
        fromISO,
        dateFormat,
    ])

    useEffect(() => {
        const chartCanvas = document.getElementById(
            ID_PREFIX + chartId,
        ) as HTMLCanvasElement

        if (chartCanvas) {
            if (chartRef.current) {
                chartRef.current.destroy()
            }

            chartRef.current = new Chart(chartCanvas, {
                type: "line",
                data: chartData,
                options: chartOptions,
            })
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy()
            }
        }
    }, [chartData, chartOptions, chartId])

    return <canvas id={ID_PREFIX + chartId} />
}

export default PriceChart
