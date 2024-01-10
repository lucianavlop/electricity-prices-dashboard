import React, { useEffect, useMemo, useRef } from "react"
import { Chart, ChartData, ChartOptions } from "chart.js/auto"
import Annotation from "chartjs-plugin-annotation"
import { useTheme } from "@mui/material/styles"
import { useI18nContext } from "i18n/i18n-react"
import { useDateTime } from "hooks/RegionalDateTime"
import { DailyAverage } from "models/DailyAverage"

Chart.register(Annotation)

export const ID_PREFIX = "average-chart-"

const hexToRGBA = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export interface DailyAverageChartProps {
    averages: DailyAverage[]
    average: number
    chartId: string
    dateFormat: string
}

const DailyAverageChart: React.FC<DailyAverageChartProps> = ({
    averages,
    average,
    chartId,
    dateFormat,
}) => {
    const { LL } = useI18nContext()
    const { fromISO } = useDateTime()
    const theme = useTheme()
    const chartRef = useRef<Chart | null>(null)

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
    }, [theme])

    const averageDataset = useMemo(
        () => Array<number>(averages.length).fill(average),
        [averages, average],
    )

    const chartData: ChartData<"line", (number | null)[]> = useMemo(() => {
        const datasets = []

        datasets.push(
            {
                label: LL.MEDIAN(),
                data: averages.map(item => item.average),
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
            labels: averages.map(item =>
                fromISO(item.date).toFormat(dateFormat),
            ),
            datasets: datasets,
        }
    }, [
        LL,
        averages,
        theme.palette.info.main,
        theme.palette.secondary.main,
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

export default DailyAverageChart
