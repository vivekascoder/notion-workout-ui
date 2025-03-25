"use client";
import { useEffect, useState } from "react";
import { getDatabase, getPages, getWeightData, notion } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "blue",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface IChartData {
  date: string;
  weight: number;
}

export function ExerciseLineChart(props: { chartData: IChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Body Weight progression</CardTitle>
        {/* <CardDescription></CardDescription> */}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={props.chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleString("default", { month: "short" });
              }}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Line
              dataKey="weight"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-desktop)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {/* Trending up by 5.2% this month <TrendingUp className="h-4 w-4" /> */}
          showing body weight changes over time.
        </div>
        {/* <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div> */}
      </CardFooter>
    </Card>
  );
}

export default function NotionGraphUi() {
  // const data = await getPages();
  // console.log(data);
  const [weightData, setWeightData] = useState<IChartData[]>([]);

  useEffect(() => {
    async function get() {
      const resp = await fetch("/api/weight");
      // console.log(await resp.json());
      setWeightData(await resp.json());
    }
    get();
  }, []);

  return (
    <div>
      <ExerciseLineChart chartData={weightData} />
    </div>
  );
}
