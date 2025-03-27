"use client";
import { useEffect, useState } from "react";
import {
  IPullData,
  IWorkoutApiResp,
  PullWoroutLineChart,
} from "./notion-graph-ui";

export default function VisualizeExercise(props: { exercise: string }) {
  const [pullWorkoutData, setPullWorkoutData] = useState<IPullData[]>([]);
  // const [exercises, setExercises] = useState<string[]>([]);

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
      </div>
    </div>
  );
}
