import {
  getWeightData,
  getWorkoutDbData,
  getWorkoutExercises,
} from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const exercise = searchParams.get("exercise");

  const weightData = await getWorkoutDbData(
    [{ direction: "ascending", property: "date" }],
    exercise
      ? { property: "exercise", select: { equals: exercise } }
      : undefined
  );
  const exercisesName = await getWorkoutExercises();
  return new Response(
    JSON.stringify({ exercises: exercisesName, data: weightData }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
