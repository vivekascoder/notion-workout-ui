"use client";
import { useEffect, useState } from "react";
import {
  IPullData,
  IWorkoutApiResp,
  PullWoroutLineChart,
} from "./notion-graph-ui";
import LWChart from "./lw-chart";
import { useStore } from "@/lib/state";

export default function VisualizeExercise(props: { exercise: string }) {
  const [pullWorkoutData, setPullWorkoutData] = useState<IPullData[]>([]);
  const { databaseId, notionToken } = useStore.getState();
  const hasHydrated = useStore((s) => s.hasHydrated);

  useEffect(() => {
    async function get() {
      const pull = await fetch(
        `/api/workouts?notionToken=${notionToken}&databaseId=${databaseId}&exercise=${props.exercise}`
      );

      const pullJson: IWorkoutApiResp = await pull.json();
      setPullWorkoutData(pullJson.data);

      const pullExercises = pullJson.exercises;
      // const pushExercises = Object.entries(pushJson[0].exercises).map(
      //   ([k, v]) => k
      // );
      // setPushWorkouts(pushExercises);
    }
    get();
  }, []);
  return (
    <div className="space-y-10 md:mx-0 px-2">
      <div className="w-full">
        {" "}
        <PullWoroutLineChart
          chartData={pullWorkoutData}
          exercise={props.exercise}
        />
        {/* <LWChart /> */}
      </div>
    </div>
  );
}
