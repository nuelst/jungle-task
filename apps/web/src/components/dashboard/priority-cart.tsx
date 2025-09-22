"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis } from "recharts"

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

type PriorityChartProps = {
  chartData: {
    priority: string
    count: number
    color: string
  }[]
}

const chartConfig = {
  count: {
    label: "Tasks",
  },
  low: {
    label: "Low",
    color: "var(--chart-1)",
  },
  medium: {
    label: "Medium",
    color: "var(--chart-2)",
  },
  high: {
    label: "High",
    color: "var(--chart-3)",
  },
  urgent: {
    label: "Urgent",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function PriorityChart({ chartData }: PriorityChartProps) {
  // Transform chartData to match the expected format
  const transformedData = chartData.map((item) => ({
    priority: item.priority,
    count: item.count,
    fill: item.color,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks by Priority</CardTitle>
        <CardDescription>
          Distribution of tasks by priority level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={transformedData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="priority"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const priorityMap: Record<string, string> = {
                  low: "Low",
                  medium: "Medium",
                  high: "High",
                  urgent: "Urgent"
                }
                return priorityMap[value] || value
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="count"
              strokeWidth={2}
              radius={8}
              activeIndex={1}
              activeBar={({ ...props }) => {
                return (
                  <Rectangle
                    {...props}
                    fillOpacity={0.8}
                    stroke={props.payload.fill}
                    strokeDasharray={4}
                    strokeDashoffset={4}
                  />
                )
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Priority distribution overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing task distribution across priority levels
        </div>
      </CardFooter>
    </Card>
  )
}