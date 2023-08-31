import React, { useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { Chart, ChartData, ChartOptions } from "chart.js/auto"
import Annotation, { LineAnnotationOptions } from "chartjs-plugin-annotation"
import { Price } from "models/Price"
import { useTheme } from "@mui/material/styles"
import { Pair } from "models/DailyPriceInfo"
import { filterAndPadPrices } from "utils/PriceUtils"

Chart.register(Annotation)

export const ID_PREFIX = "daily-chart-"

const hexToRGBA = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export interface DailyChartProps {
    prices: Price[]
    median: number
    chartId: string
    dateFormat: string
    showCurrentPrice: boolean
    cheapestPeriods: Pair<Price[]>
    expensivePeriod: Price[]
}

const DailyChart: React.FC<DailyChartProps> = ({
    prices,
    median,
    chartId,
    dateFormat,
    showCurrentPrice,
    cheapestPeriods,
    expensivePeriod,
}) => {
    const theme = useTheme()
    const [currentPriceLocation, setCurrentPriceLocation] = useState(-1)
    const chartRef = useRef<Chart | null>(null)

    useEffect(() => {
        if (!showCurrentPrice || prices.length <= 1) return
        // Function to be executed every minute
        const updateData = () => {
            if (!showCurrentPrice || prices.length <= 1) return
            const canvasWidth = prices.length - 1
            const startTime = new Date(prices[0].dateTime).getTime()
            const endTime = new Date(
                prices[prices.length - 1].dateTime,
            ).getTime()
            const currentTime = new Date().getTime()

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
    }, [prices, showCurrentPrice])

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

    const cheapestPeriodsPadded = useMemo(() => {
        return [
            filterAndPadPrices(cheapestPeriods.first),
            filterAndPadPrices(cheapestPeriods.second),
        ]
    }, [cheapestPeriods])

    const expensivePeriodPadded = useMemo(
        () => filterAndPadPrices(expensivePeriod),

        [expensivePeriod],
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
        return {
            labels: paddedPrices.map(item =>
                format(new Date(item.dateTime), dateFormat),
            ),
            datasets: [
                {
                    label: "Hide",
                    data: cheapestPeriodsPadded[0],
                    backgroundColor: hexToRGBA(theme.palette.success.main, 0.2),
                    showLine: false,
                    fill: "start",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: cheapestPeriodsPadded[0],
                    backgroundColor: hexToRGBA(theme.palette.success.main, 0.2),
                    showLine: false,
                    fill: "end",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: cheapestPeriodsPadded[1],
                    backgroundColor: hexToRGBA(theme.palette.success.main, 0.2),
                    showLine: false,
                    fill: "start",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: cheapestPeriodsPadded[1],
                    backgroundColor: hexToRGBA(theme.palette.success.main, 0.2),
                    showLine: false,
                    fill: "end",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: expensivePeriodPadded,
                    backgroundColor: hexToRGBA(theme.palette.error.main, 0.2),
                    showLine: false,
                    fill: "start",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: expensivePeriodPadded,
                    backgroundColor: hexToRGBA(theme.palette.error.main, 0.2),
                    showLine: false,
                    fill: "end",
                    pointRadius: 0,
                },
                {
                    label: "Precio",
                    data: paddedPrices.map(item => item.price),
                    borderColor: theme.palette.info.main,
                    backgroundColor: hexToRGBA(theme.palette.info.main, 0.4),
                    pointRadius: 0,
                },
                {
                    label: "Precio Promedio (30 días)",
                    data: averageDataset,
                    borderColor: theme.palette.secondary.main,
                    backgroundColor: hexToRGBA(
                        theme.palette.secondary.main,
                        0.2,
                    ),
                    pointRadius: 0,
                },
            ],
        }
    }, [
        averageDataset,
        cheapestPeriodsPadded,
        dateFormat,
        expensivePeriodPadded,
        paddedPrices,
        theme,
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

export default DailyChart
