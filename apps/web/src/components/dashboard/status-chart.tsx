"use client"

import { TrendingUp } from "lucide-react"
import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type StatusChartProps = {
  chartData: {
    status: string
    count: number
    color: string
  }[]
}

const chartConfig = {
  count: {
    label: "Tasks",
  },
  done: {
    label: "Done",
    color: "var(--chart-1)",
  },
  "In Progress": {
    label: "In Progress",
    color: "var(--chart-2)",
  },
  "To Do": {
    label: "To Do",
    color: "var(--chart-3)",
  },
  review: {
    label: "Review",
    color: "var(--chart-4)",
  },
  "No Data": {
    label: "No Data",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function StatusChart({ chartData }: StatusChartProps) {
  // Transform chartData to match the expected format
  const transformedData = chartData.map((item) => ({
    status: item.status,
    count: item.count,
    fill: item.color,
  }))

  const totalTasks = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [chartData])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Tasks by Status</CardTitle>
        <CardDescription>
          Distribution of tasks by status
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={transformedData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalTasks.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Tasks
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Task status overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing task distribution across status levels
        </div>
      </CardFooter>
    </Card>
  )
} 