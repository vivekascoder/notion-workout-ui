"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  getDatabase,
  getPages,
  getWeightData,
  modes,
  notion,
  parseLog,
  TMode,
} from "@/lib/utils";
import React from "react";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
    color: "green",
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

export function BodyWeightLineChart(props: { chartData: IChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Body Weight progression</CardTitle>
        {/* <CardDescription></CardDescription> */}
      </CardHeader>
      <CardContent className="mx-2 px-0">
        <ChartContainer config={chartConfig} className="">
          <LineChart
            accessibilityLayer
            data={props.chartData}
            margin={{
              left: 0,
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
                return date.toLocaleDateString("default", {
                  month: "short",
                  day: "2-digit",
                });
              }}
            />
            <YAxis
              tickCount={6}
              domain={["auto", "dataMax + 2"]}
              interval="preserveStart"
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
  mode: TMode;
  setMode: Dispatch<SetStateAction<TMode>>;
}

const DropDownModeBtn: React.FC<IDropDownModeBtnProps> = (props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={"sm"}>
          M: {props.mode}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Select mode of data</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {modes.map((mode) => (
          <DropdownMenuItem
            key={mode}
            onClick={() => {
              props.setMode(mode);
            }}
          >
            {mode}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface IPullData {
  date: string;
  exercise: string;
  sets: string;
}
[];

interface IWorkoutApiResp {
  exercises: string[];
  data: IPullData[];
}
export function PullWoroutLineChart(props: {
  chartData: IPullData[];
  exercise: string;
}) {
  const [mode, setMode] = useState<TMode>("total weight");
  const [filteredData, setFilteredData] = useState<
    { date: string; value: number }[]
  >([]);

  useEffect(() => {
    setFilteredData(
      props.chartData
        .filter((i) => i.exercise === props.exercise)
        .map((i) => ({
          date: i.date,
          value: parseLog(i.sets, mode),
        }))
        .filter((i) => !isNaN(i.value) || i.value != 0)
    );
    // console.log(filteredData);
  }, [mode, props.chartData]);

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="flex justify-between items-center relative">
          {props.exercise}
          <DropDownModeBtn mode={mode} setMode={setMode} />
        </CardTitle>
      </CardHeader>
      <CardContent className="mx-2 px-0">
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={filteredData}
            margin={
              {
                // left: 12,
                // right: 12,
              }
            }
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
            <YAxis
              // tickCount={6}
              domain={["auto", "dataMax + 5"]}
              interval="preserveStart"
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
          showing changes over time in {props.exercise} workouts.
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
  const [pullWorkouts, setPullWorkouts] = useState<string[]>([]);

  const [pushWorkoutData, setPushWorkoutData] = useState<IPullData[]>([]);
  const [pushWorkouts, setPushWorkouts] = useState<string[]>([]);

  useEffect(() => {
    async function get() {
      // const resp = await fetch("/api/weight");
      const pull = await fetch("/api/workouts");
      // const push = await fetch("/api/push");
      // console.log(await resp.json());
      // setWeightData(await resp.json());
      const pullJson: IWorkoutApiResp = await pull.json();
      // const pushJson = await push.json();
      setPullWorkoutData(pullJson.data);
      // setPushWorkoutData(pushJson);

      const pullExercises = pullJson.exercises;
      // const pushExercises = Object.entries(pushJson[0].exercises).map(
      //   ([k, v]) => k
      // );
      setPullWorkouts(pullExercises);
      // setPushWorkouts(pushExercises);
    }
    get();
  }, []);

  return (
    <div className="space-y-10 md:mx-0 px-2">
      {/* <div>
        <h2 className="text-xl font-semibold mb-5">Body weight</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BodyWeightLineChart chartData={weightData} />
        </div>
      </div> */}
      <div className="">
        <h2 className="text-xl font-semibold mb-5">Pull workout</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pullWorkouts.map((exercise) => (
            <PullWoroutLineChart
              key={exercise}
              chartData={pullWorkoutData}
              exercise={exercise}
            />
          ))}
        </div>
      </div>

      {/* <div className="">
        <h2 className="text-xl font-semibold mb-5">Push workout</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pushWorkouts.map((exercise) => (
            <PullWoroutLineChart
              key={exercise}
              chartData={pushWorkoutData}
              exercise={exercise}
            />
          ))}
        </div>
      </div> */}
    </div>
  );
}
