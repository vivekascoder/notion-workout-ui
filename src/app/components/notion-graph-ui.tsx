"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getDatabase,
  getPages,
  getWeightData,
  notion,
  parseLog,
  TMode,
} from "@/lib/utils";
import React from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DropdownMenuShortcut } from "@/components/ui/dropdown-menu";

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
interface IDropDownModeBtnProps {
  setMode: Dispatch<SetStateAction<TMode>>;
}

const DropDownModeBtn: React.FC<IDropDownModeBtnProps> = (props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={"sm"}>
          mode
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Select mode of data</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            props.setMode("total weight");
          }}
        >
          total weight
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            props.setMode("max weight");
          }}
        >
          max weight
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface IPullData {
  date: string;
  exercises: { [key: string]: string };
}
[];
export function PullWoroutLineChart(props: { chartData: IPullData[] }) {
  const [mode, setMode] = useState<TMode>("total weight");
  const [filteredData, setFilteredData] = useState<
    { date: string; value: number }[]
  >([]);

  useEffect(() => {
    setFilteredData(
      props.chartData.map((i) => ({
        date: i.date,
        value: parseLog(i.exercises["lat pull down"], mode),
      }))
    );
    console.log(filteredData);
  }, [mode, props.chartData]);

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex justify-between items-center relative">
          Pull workout data
          <DropDownModeBtn setMode={setMode} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={filteredData}
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
                return date.toLocaleString("default", {
                  month: "short",
                  day: "2-digit",
                });
              }}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <Line
              dataKey="value"
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
  const [pullWorkoutData, setPullWorkoutData] = useState<IPullData[]>([]);

  useEffect(() => {
    async function get() {
      const resp = await fetch("/api/weight");
      const pull = await fetch("/api/pull");
      // console.log(await resp.json());
      setWeightData(await resp.json());
      setPullWorkoutData(await pull.json());
    }
    get();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <ExerciseLineChart chartData={weightData} />
      <PullWoroutLineChart chartData={pullWorkoutData} />
    </div>
  );
}
