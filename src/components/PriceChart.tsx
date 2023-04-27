import React, { useEffect, useMemo } from "react"
import {
    getCheapestPeriod,
    getMostExpensivePeriod,
} from "services/PriceService"
import { format, isSameHour } from "date-fns"
import Chart, { ChartData, ChartOptions } from "chart.js/auto"
import { Price } from "models/Price"
import { useTheme } from "@mui/material/styles"

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
    showCheapPeriod: boolean
    showExpensivePeriod: boolean
}

const DailyChart: React.FC<DailyChartProps> = ({
    prices,
    median,
    chartId,
    dateFormat,
    showCurrentPrice,
    showCheapPeriod,
    showExpensivePeriod,
}) => {
    const theme = useTheme()

    let chart: Chart | undefined

    const chartOptions = useMemo(() => {
        const chartOptions: ChartOptions = {
            plugins: {
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
                    labels: {
                        filter: item => {
                            return item.text !== "Hide" // Hide the label for 'Dataset 2'
                        },
                        color:
                            theme.palette.mode === "dark"
                                ? theme.palette.grey[400]
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
                    },
                    ticks: {
                        color:
                            theme.palette.mode === "dark"
                                ? theme.palette.grey[400]
                                : theme.palette.grey[800],
                    },
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color:
                            theme.palette.mode === "dark"
                                ? theme.palette.grey[400]
                                : theme.palette.grey[800],
                    },
                },
            },
        }
        return chartOptions
    }, [theme])

    const cheapPeriod = useMemo(() => {
        if (!showCheapPeriod) return Array<null>(prices.length).fill(null)

        const cp = getCheapestPeriod(prices, 3)
        return prices.map(item => {
            // If the dateTime of item is contained in cp, return the price, else return null
            if (cp.find(cpItem => cpItem.dateTime === item.dateTime)) {
                return item.price
            } else {
                return null
            }
        })
    }, [prices, showCheapPeriod])

    const expensivePeriod = useMemo(() => {
        if (!showExpensivePeriod) return Array<null>(prices.length).fill(null)

        const ep = getMostExpensivePeriod(prices, 3)
        return prices.map(item => {
            // If the dateTime of item is contained in ep, return the price, else return null
            if (ep.find(epItem => epItem.dateTime === item.dateTime)) {
                return item.price
            } else {
                return null
            }
        })
    }, [prices, showExpensivePeriod])

    const currentPriceDataset = useMemo(() => {
        if (!showExpensivePeriod) return Array<null>(prices.length).fill(null)
        const today = new Date()
        const nextHour = new Date()
        nextHour.setHours(nextHour.getHours() + 1)
        return prices.map(item => {
            // If the dateTime of item is contained in cp, return the price, else return null
            if (
                isSameHour(new Date(item.dateTime), today) ||
                isSameHour(new Date(item.dateTime), nextHour)
            ) {
                return item.price
            } else {
                return null
            }
        })
    }, [prices, showExpensivePeriod])

    const averageDataset = useMemo(
        () => Array<number>(prices.length).fill(median),
        [prices, median],
    )

    const chartData: ChartData<"line", (number | null)[]> = useMemo(() => {
        return {
            labels: prices.map(item =>
                format(new Date(item.dateTime), dateFormat),
            ),
            datasets: [
                {
                    label: "Hide",
                    data: currentPriceDataset,
                    backgroundColor: hexToRGBA(theme.palette.info.main, 0.6),
                    showLine: false,
                    fill: "start",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: currentPriceDataset,
                    backgroundColor: hexToRGBA(theme.palette.info.main, 0.6),
                    showLine: false,
                    fill: "end",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: cheapPeriod,
                    backgroundColor: hexToRGBA(theme.palette.success.main, 0.4),
                    showLine: false,
                    fill: "start",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: cheapPeriod,
                    backgroundColor: hexToRGBA(theme.palette.success.main, 0.4),
                    showLine: false,
                    fill: "end",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: expensivePeriod,
                    backgroundColor: hexToRGBA(theme.palette.warning.main, 0.4),
                    showLine: false,
                    fill: "start",
                    pointRadius: 0,
                },
                {
                    label: "Hide",
                    data: expensivePeriod,
                    backgroundColor: hexToRGBA(theme.palette.warning.main, 0.4),
                    showLine: false,
                    fill: "end",
                    pointRadius: 0,
                },
                {
                    label: "Precio",
                    data: prices.map(item => item.price),
                    borderColor: theme.palette.primary.main,
                    backgroundColor: hexToRGBA(theme.palette.primary.main, 0.4),
                    pointRadius: 0,
                },
                {
                    label: "Media",
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
        cheapPeriod,
        currentPriceDataset,
        dateFormat,
        expensivePeriod,
        prices,
        theme.palette.info.main,
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
    ])

    useEffect(() => {
        const chartCanvas = document.getElementById(
            ID_PREFIX + chartId,
        ) as HTMLCanvasElement

        if (chartCanvas) {
            if (chart) {
                chart.destroy()
            }

            chart = new Chart(chartCanvas, {
                type: "line",
                data: chartData,
                options: chartOptions,
            })
        }

        return () => {
            if (chart) {
                chart.destroy()
            }
        }
    }, [chartData])

    return <canvas id={ID_PREFIX + chartId} />
}

export default DailyChart
