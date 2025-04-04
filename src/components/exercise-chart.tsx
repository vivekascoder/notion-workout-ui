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
  ChartLegend,
  ChartLegendContent,
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
  Book,
  Calendar,
  ChevronUp,
  Clock,
  Dumbbell,
  TrendingUp,
} from "lucide-react";
import LWChart from "./lw-chart";
import { UTCTimestamp } from "lightweight-charts";
import { useStore } from "@/lib/state";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Input } from "./ui/input";
import { IPullData } from "./notion-graph-ui";

interface IDropDownModeBtnProps {
  mode: TMode;
  setMode: Dispatch<SetStateAction<TMode>>;
}

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

export function ExerciseChart(props: {
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
  const [maxRM, setMaxRM] = useState<number>(0);

  const [idealRepsWeight, setIdealRepsWeight] = useState<number>(10);
  const onChangeRepsHandler = () => {
    setIdealRepsWeight(idealRepsWeight);
  };
  const computeWFromR = (reps: number, rm: number) => {
    return Math.round(rm / (1 + reps / 30));
  };

  const [weightVs1RMData, setWeightVs1RMData] = useState<
    {
      maxRm: number;
      date: number;
      rm1: number;
      weight: number;
      visual: string;
    }[]
  >([]);

  const repsVsWeightData: {
    date: string;
    reps: number;
    weight: number;
    visual: string;
  }[] = [];

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
    const sortedWPrs = Object.entries(prs)
      .map(([k, v]) => ({ weight: +k, reps: v, rm1: +k * (1 + v / 30) }))
      .sort((a, b) => b.weight - a.weight);
    setWeightPRs(sortedWPrs);

    if (sortedWPrs.length > 0) {
      const d: typeof sortedWPrs = JSON.parse(JSON.stringify(sortedWPrs));
      const maxRm = d.sort((a, b) => b.rm1 - a.rm1)[0].rm1;
      setMaxRM(maxRm);

      const wvrmdata: typeof weightVs1RMData = [];
      props.chartData.forEach((i) => {
        const parsed = parseLog(i.sets, mode);
        parsed.sets.map((s) => {
          wvrmdata.push({
            maxRm: maxRm,
            date: new Date(i.date).getTime() / 1000,
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
      setWeightVs1RMData(wvrmdata);
    }
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
                <div className="text-sm font-bold mt-1">{max?.visual}</div>
                <div className="text-green-400 text-sm">
                  {max?.value}kg total
                </div>
              </div>

              <div className="bg-[var(--secondary)] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Today</span>
                  <Clock className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-sm font-bold mt-1">
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
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  return new Date(value * 1000).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  });
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

              {/* 
               <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  className="w-[180px]"
                  formatter={(value, name, item, index) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                        style={
                          {
                            "--color-bg": `var(--color-${name})`,
                          } as React.CSSProperties
                        }
                      />
                      {chartConfig[name as keyof typeof chartConfig]?.label ||
                        name}
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {value}
                        <span className="font-normal text-muted-foreground">
                          kcal
                        </span>
                      </div>
                                           Add this after the last item 
                      {index === 1 && (
                        <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                          Total
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                            {item.payload.running + item.payload.swimming}
                            <span className="font-normal text-muted-foreground">
                              kcal
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                /></ChartContainer>
               */}

              <ChartTooltip
                cursor={true}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="w-[250px]"
                    formatter={(value, name, item, index) => (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                          style={
                            {
                              "--color-bg": `var(--color-${name})`,
                            } as React.CSSProperties
                          }
                        />
                        {chartConfig[name as keyof typeof chartConfig]?.label ||
                          name}
                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                          {(value as number).toFixed(1)}
                          <span className="font-normal text-muted-foreground">
                            kg
                          </span>
                        </div>

                        {index === 2 && (
                          <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                            Set{" "}
                            {new Date(
                              item.payload.date * 1000
                            ).toLocaleDateString()}
                            :
                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                              {item.payload.visual}:{" "}
                              {(item.payload.rm1 as number).toFixed(1)}
                              <span className="font-normal text-muted-foreground">
                                kg
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  />
                }
              />
              <Line
                name="set's 1 rep max"
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
              <Line
                name="best 1RM of all"
                dataKey="maxRm"
                type="natural"
                stroke="red"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-desktop)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
              <Line
                name="set's weight"
                dataKey="weight"
                type="natural"
                stroke="yellow"
                strokeWidth={2}
                dot={{
                  fill: "var(--color-desktop)",
                }}
                activeDot={{
                  r: 6,
                }}
              />
              <ChartLegend className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
            </LineChart>
          </ChartContainer>
          <CardFooter className="block gap-2 text-sm">
            <div className="flex gap-2 font-medium  justify-between items-center">
              {"->"} shows you ur intensity with the most intensity you've shown
              based on estimated 1RM. the close to red line your workout session
              have been the most intense you've trained.
              <br />
              {"->"} shows intensity of ur sets over time based on Epely's
              formula
            </div>
          </CardFooter>
        </CardContent>
      </Card>

      <Card className="">
        <CardHeader>
          <CardTitle className="flex justify-between items-center relative">
            Estimated weight for reps
          </CardTitle>
        </CardHeader>
        <CardContent className="mx-2 space-y-5">
          <div className="flex items-center justify-between ">
            <Input
              className="w-2/3"
              type="number"
              value={idealRepsWeight}
              onChange={(e) => {
                setIdealRepsWeight(Number(e.target.value));
              }}
              placeholder="Enter reps"
            />
            <span className="text-lg font-semibold">
              {computeWFromR(idealRepsWeight, maxRM)}kg
            </span>
          </div>
          <p className="text-sm">
            ⚠️ NOTE: This computes the ideal weight u should lift for given reps
            based on ur max 1RM from logs and Epely formula.
          </p>
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
                dataKey="weight"
                tickFormatter={(v) => `${v.toFixed(1)}kg`}
              />

              <Radar
                dataKey="rm1"
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
