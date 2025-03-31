"use client";
import { useEffect, useState } from "react";
import { IPullData, IWorkoutApiResp } from "./notion-graph-ui";
import LWChart from "./lw-chart";
import { useStore } from "@/lib/state";
import { ExerciseChart } from "./exercise-chart";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Book } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function VisualizeExercise(props: { exercise: string }) {
  const [pullWorkoutData, setPullWorkoutData] = useState<IPullData[]>([]);
  const { databaseId, notionToken } = useStore.getState();
  const hasHydrated = useStore((s) => s.hasHydrated);

  const queryFn = async () => {
    const workout = await fetch(
      `/api/workouts?notionToken=${notionToken}&databaseId=${databaseId}&exercise=${props.exercise}`
    );

    if (workout.status !== 200) {
      throw new Error("Failed to fetch data");
    }

    const workoutJson: IWorkoutApiResp = await workout.json();
    return workoutJson;
  };
  const { isPending, error, data } = useQuery({
    queryKey: [`workoutExerciseData_${props.exercise}`],
    queryFn: queryFn,
    retry: 3,
  });

  useEffect(() => {
    async function get() {
      // const pull = await fetch(
      //   `/api/workouts?notionToken=${notionToken}&databaseId=${databaseId}&exercise=${props.exercise}`
      // );

      if (error) {
        console.log(error);
        return;
      }
      if (!data) {
        return;
      }

      // const pullJson: IWorkoutApiResp = await pull.json();
      const pullJson = data;
      setPullWorkoutData(pullJson.data);

      const pullExercises = pullJson.exercises;
      // const pushExercises = Object.entries(pushJson[0].exercises).map(
      //   ([k, v]) => k
      // );
      // setPushWorkouts(pushExercises);
    }
    get();
  }, [data]);

  return (
    <div className="space-y-10 md:mx-0 px-2">
      <div className="w-full">
        {" "}
        {notionToken ? (
          <ExerciseChart
            chartData={pullWorkoutData}
            exercise={props.exercise}
          />
        ) : (
          <>
            <div>
              <Alert>
                <Book className="h-4 w-4" />
                <AlertTitle>Make yours</AlertTitle>
                <AlertDescription>
                  <div>
                    Check out the{" "}
                    <Link
                      className="hover:underline hover:font-semibold hover:cursor-alias"
                      href={"/setup"}
                    >
                      setup
                    </Link>{" "}
                    to make steup for ur workouts.
                  </div>
                </AlertDescription>
              </Alert>
            </div>
            <div>
              <p>Setup ur Notion token and database id first</p>
              <Button className="mt-3">
                {" "}
                <Link href="/setup">Setup page</Link>
              </Button>
            </div>
          </>
        )}
        {/* <LWChart /> */}
      </div>
    </div>
  );
}
