"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  cn,
  getMaxValue,
  getPnLDaily,
  getStreak,
  modes,
  notion,
  parseLog,
  TMode,
} from "@/lib/utils";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  RadarChart,
  Radar,
  XAxis,
  YAxis,
} from "recharts";
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
import { LinkList } from "./link-list";
import { Skeleton } from "./ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Award,
  BarChart2,
  Calendar,
  ChevronUp,
  Clock,
  Dumbbell,
  TrendingUp,
} from "lucide-react";
import LWChart from "./lw-chart";
import { UTCTimestamp } from "lightweight-charts";

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

            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator="line" />}
            />
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

export interface IPullData {
  date: string;
  exercise: string;
  sets: string;
}
[];

export interface IWorkoutApiResp {
  exercises: string[];
  data: IPullData[];
}

export function PullWoroutLineChart(props: {
  chartData: IPullData[];
  exercise: string;
}) {
  const [mode, setMode] = useState<TMode>("total weight");
  const [filteredData, setFilteredData] = useState<
    { date: string; value: number; visual: string }[]
  >([]);
  const [max, setMax] = useState<
    { date: string; value: number; visual: string } | undefined
  >();
  const [daily, setDaily] = useState<number>(0);
  const [averageWeight, setAverageWeight] = useState<number>(0);
  const [averageSet, setAverageSet] = useState<number>(0);
  const [weightPRs, setWeightPRs] = useState<
    { weight: number; reps: number }[]
  >([]);

  const weightVs1RMData: {
    date: string;
    rm1: number;
    weight: number;
    visual: string;
  }[] = [];

  const repsVsWeightData: {
    date: string;
    reps: number;
    weight: number;
    visual: string;
  }[] = [];

  props.chartData.forEach((i) => {
    const parsed = parseLog(i.sets, mode);
    parsed.sets.map((s) => {
      weightVs1RMData.push({
        date: i.date,
        rm1: s.weight * (1 + s.reps / 30),
        weight: s.weight,
        visual: `${s.weight} x ${s.reps}`,
      });

      repsVsWeightData.push({
        date: i.date,
        reps: s.reps,
        weight: s.weight,
        visual: `${s.weight} x ${s.reps}`,
      });
    });
  });

  useEffect(() => {
    let totalW = 0;
    let freqW = 0;
    let totalS = 0;
    let freqS = 0;
    const prs: { [key: number]: number } = {};
    const filteredApiData = props.chartData
      .map((i) => {
        const parsed = parseLog(i.sets, mode);
        parsed.sets.map((s) => {
          totalW += s.weight;
          freqW += 1;
          totalS += s.reps;
          freqS += 1;
          if (prs[s.weight] == null) {
            prs[s.weight] = s.reps;
          } else {
            if (prs[s.weight] < s.reps) {
              prs[s.weight] = s.reps;
            }
          }
        });

        return {
          date: i.date,
          value: parsed.value,
          visual: parsed.visual,
        };
      })
      .filter((i) => !isNaN(i.value) || i.value != 0);
    setAverageWeight(totalW / freqW);
    setAverageSet(totalS / freqS);

    setFilteredData(filteredApiData);

    setMax(getMaxValue(filteredApiData));
    setDaily(parseFloat(getPnLDaily(filteredApiData)));
    setWeightPRs(
      Object.entries(prs)
        .map(([k, v]) => ({ weight: +k, reps: v, rm1: +k * (1 + v / 30) }))
        .sort((a, b) => b.weight - a.weight)
    );

    // console.log(filteredData);
  }, [mode, props.chartData]);

  if (!filteredData.length) {
    return <Skeleton className=" h-40 rounded-md" />;
  }

  return (
    <div className="space-y-10">
      <Card className="">
        <CardHeader>
          <CardTitle className="flex justify-between items-center relative">
            {props.exercise}
            <DropDownModeBtn mode={mode} setMode={setMode} />
          </CardTitle>
        </CardHeader>
        <CardContent className="mx-2 px-0">
          <LWChart
            data={filteredData.map((v) => ({
              time: Math.floor(
                new Date(v.date).getTime() / 1000
              ) as UTCTimestamp,
              value: Number(v.value),
              visual: v.visual,
            }))}
          />
        </CardContent>
        {/* <CardFooter className="block gap-2 text-sm">
        <div className="flex gap-2 font-medium  justify-between items-center">
          <p className="text-md">
            <span className="fond-bold">Best: </span>
            {(() => {
              const max = getMaxValue(filteredData);
              return `${max.visual} = ${max.value} KG`;
            })()}
          </p>
          <p className="text-md">
            <span className="fond-bold">Daily P/L: </span>
            {`${getPnLDaily(filteredData)}%`}
          </p>
        </div>
      </CardFooter> */}
        <CardFooter className="border-t border-gray-800 pt-4 pb-4 px-4">
          <div className="w-full">
            {/* Main stats row */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-[var(--secondary)] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Personal Best</span>
                  <Award className="h-4 w-4 text-yellow-400" />
                </div>
                <div className="text-lg font-bold mt-1">{max?.visual}</div>
                <div className="text-green-400 text-sm">
                  {max?.value}kg total
                </div>
              </div>

              <div className="bg-[var(--secondary)] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Today</span>
                  <Clock className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-lg font-bold mt-1">
                  {filteredData[filteredData.length - 1].visual} kg
                </div>
                <div
                  className={cn(
                    "text-sm flex items-center gap-1",
                    daily < 0 ? "text-red-400" : "text-green-400"
                  )}
                >
                  {daily < 0 ? (
                    <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUp className="h-3 w-3" />
                  )}
                  {Math.abs(daily)}%
                </div>
              </div>

              {/* <div className="bg-[var(--secondary)] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Max Potential</span>
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-lg font-bold mt-1">{10}% of max</div>
              <div className="text-yellow-400 text-sm">{120}kg highest</div>
            </div> */}

              {/* <div className="bg-[var(--secondary)] rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Avg Volume</span>
                <BarChart2 className="h-4 w-4 text-green-400" />
              </div>
              <div className="text-lg font-bold mt-1">{100}kg</div>
              <div className="text-blue-400 text-sm">{34}</div>
            </div> */}
            </div>

            {/* Second stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[var(--secondary)] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-xs">Daily</div>
                  <div
                    className={cn(
                      "flex items-center text-sm font-semibold",
                      daily < 0 ? "text-red-400" : "text-green-400"
                    )}
                  >
                    {daily < 0 ? (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(daily)}%
                  </div>
                </div>
                <Dumbbell className="h-5 w-5 text-gray-500" />
              </div>

              {/* <div className="bg-[var(--secondary)] rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-xs">Weekly</div>
                <div className="flex items-center text-sm font-semibold text-green-400">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {20}%
                </div>
              </div>
              <Calendar className="h-5 w-5 text-gray-500" />
            </div> */}

              <div className="bg-[var(--secondary)] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-xs">Streak</div>
                  <div className="text-sm font-semibold text-orange-400">
                    {getStreak(filteredData)} workouts
                  </div>
                </div>
                <ChevronUp className="h-5 w-5 text-orange-400" />
              </div>
              <div className="bg-[var(--secondary)] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-xs">Average Weight</div>
                  <div className="text-sm font-semibold text-orange-400">
                    {averageWeight.toFixed(2)} KG
                  </div>
                </div>
                <ChevronUp className="h-5 w-5 text-orange-400" />
              </div>
              <div className="bg-[var(--secondary)] rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-xs">Average Set</div>
                  <div className="text-sm font-semibold text-orange-400">
                    {averageSet.toFixed(2)}
                  </div>
                </div>
                <ChevronUp className="h-5 w-5 text-orange-400" />
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* 1rm vs weight chart */}
      <Card className="">
        <CardHeader>
          <CardTitle className="flex justify-between items-center relative">
            Estimated 1RM vs Weight
          </CardTitle>
        </CardHeader>
        <CardContent className="mx-2 px-0">
          <ChartContainer config={chartConfig} className="">
            <LineChart
              accessibilityLayer
              data={weightVs1RMData}
              margin={{
                left: 0,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="weight"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  return `${value.toFixed(1)}kg`;
                }}
              />
              <YAxis
                tickCount={6}
                domain={["auto", "dataMax + 2"]}
                interval="preserveStart"
                tickFormatter={(value) => {
                  return `${value.toFixed(1)}kg`;
                }}
              />

              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="rm1"
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
      </Card>

      {/* reps vs weight chart i.e intensity vs endurance */}
      {/* <Card className="">
        <CardHeader>
          <CardTitle className="flex justify-between items-center relative">
            Intensity vs endurance, i.e reps vs weight
          </CardTitle>
        </CardHeader>
        <CardContent className="mx-2 px-0">
          <ChartContainer config={chartConfig} className="">
            <LineChart
              accessibilityLayer
              data={repsVsWeightData}
              margin={{
                left: 0,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="reps"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  return value;
                }}
              />
              <YAxis
                tickCount={6}
                domain={["auto", "dataMax + 2"]}
                interval="preserveStart"
                tickFormatter={(value) => {
                  return `${value.toFixed(1)}kg`;
                }}
              />

              <ChartTooltip
                cursor={true}
                content={<ChartTooltipContent indicator="line" />}
              />
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
      </Card> */}

      {/* weight prs card */}
      <Card className="w-full mx-auto ">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>{props.exercise} PRs</CardTitle>
          <div className="flex items-center space-x-2"></div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadarChart data={weightPRs}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarGrid gridType="circle" />
              <PolarAngleAxis
                dataKey="rm1"
                tickFormatter={(v) => `${v.toFixed(2)}kg`}
              />

              <Radar
                dataKey="weight"
                fill="var(--color-desktop)"
                fillOpacity={0.6}
                dot={{
                  r: 4,
                  fillOpacity: 1,
                }}
              />
            </RadarChart>
          </ChartContainer>
          <br />
          <ul className="space-y-2">
            {weightPRs.map((pr, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-3 rounded-md border bg-background hover:bg-accent transition-colors"
              >
                <div>
                  <span className="font-medium">{pr.weight} kg</span>
                  <p className="text-xs">
                    estimated 1 RM is{" "}
                    <span className="text-green-500">
                      {(pr.weight * (1 + pr.reps / 30)).toFixed(2)}kg
                    </span>
                  </p>
                </div>
                <span className="px-2 py-1 bg-muted rounded-md text-sm">
                  {pr.reps} reps
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <p className="text-sm">
            Note that that 1RM is computed using Epley formula
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function NotionGraphUi() {
  // const data = await getPages();
  // console.log(data);
  const [weightData, setWeightData] = useState<IChartData[]>([]);
  const [pullWorkoutData, setPullWorkoutData] = useState<IPullData[]>([]);
  const [pullWorkouts, setPullWorkouts] = useState<string[]>([]);
  const [exercises, setExercises] = useState<string[]>([]);

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

      const pullExercises = pullJson.exercises.sort();
      setExercises(pullExercises);
      // const pushExercises = Object.entries(pushJson[0].exercises).map(
      //   ([k, v]) => k
      // );
      setPullWorkouts(pullExercises);
      // setPushWorkouts(pushExercises);
    }
    get();
  }, []);

  if (!exercises.length) {
    return <Skeleton className="h-40 rounded-md w-full" />;
  }

  return (
    <div className="space-y-10 md:mx-0 px-2">
      {/* <div>
        <h2 className="text-xl font-semibold mb-5">Body weight</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BodyWeightLineChart chartData={weightData} />
        </div>
      </div> */}

      {/* write h2 tag as title of link list */}
      <h2 className="text-xl font-semibold mb-5">Exercises</h2>

      <LinkList
        links={exercises.map((e) => ({
          href: `/visualize/${e}`,
          title: e.toLocaleUpperCase(),
          description: `visualize the progression on ${e}`,
        }))}
      />
    </div>
  );
}
