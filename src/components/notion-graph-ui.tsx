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
import { useQuery } from "@tanstack/react-query";
import { TransitionLink } from "./transition-link";

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

export default function NotionGraphUi() {
  const [weightData, setWeightData] = useState<IChartData[]>([]);
  const [pullWorkoutData, setPullWorkoutData] = useState<IPullData[]>([]);
  const [pullWorkouts, setPullWorkouts] = useState<string[]>([]);
  const [exercises, setExercises] = useState<string[]>([]);
  const { databaseId, notionToken } = useStore.getState();
  const hasHydrated = useStore((s) => s.hasHydrated);

  const queryFnWorkoutData = async () => {
    await useStore.persist.rehydrate();
    const pull = await fetch(
      `/api/workouts?notionToken=${notionToken}&databaseId=${databaseId}`
    );
    if (pull.status !== 200) {
      throw new Error("Failed to fetch data");
    }
    const pullJson: IWorkoutApiResp = await pull.json();
    return pullJson;
  };
  const { isPending, error, data, isError, status } = useQuery({
    queryKey: ["workoutData"],
    queryFn: queryFnWorkoutData,
    retry: 3,
  });

  useEffect(() => {
    async function get() {
      if (!data) {
        return;
      }
      if (isError) {
        return;
      }
      const pullJson = data;

      // const pushJson = await push.json();
      setPullWorkoutData(pullJson.data);
      // setPushWorkoutData(pushJson);

      const pullExercises = pullJson.exercises.sort();
      setExercises(pullExercises);
      setPullWorkouts(pullExercises);
    }
    get();
  }, [data]);

  if (!hasHydrated) {
    return <Skeleton className="h-40 rounded-md w-full" />;
  }

  if (notionToken) {
    if (!exercises.length) {
      return <Skeleton className="h-40 rounded-md w-full" />;
    }
  }

  return (
    <div className="space-y-10 md:mx-0 px-2">
      {notionToken ? (
        <div>
          <h2 className="text-3xl font-semibold mb-5"># Exercises</h2>
          <LinkList
            links={exercises.map((e) => ({
              href: `/visualize/${e}`,
              title: e,
              description: `visualize the progression on ${e}`,
            }))}
          />
        </div>
      ) : (
        <>
          <div>
            <Alert>
              <Book className="h-4 w-4" />
              <AlertTitle>Make yours</AlertTitle>
              <AlertDescription>
                <div>
                  Check out the{" "}
                  <TransitionLink
                    className="hover:underline hover:font-semibold hover:cursor-alias"
                    href={"/setup"}
                  >
                    setup
                  </TransitionLink>{" "}
                  to make steup for ur workouts.
                </div>
              </AlertDescription>
            </Alert>
          </div>
          <div>
            <p>Setup ur Notion token and database id first</p>
            <Button className="mt-3">
              {" "}
              <TransitionLink href="/setup">Setup page</TransitionLink>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
