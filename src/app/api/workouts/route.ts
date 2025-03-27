import {
  getWeightData,
  getWorkoutDbData,
  getWorkoutExercises,
} from "@/lib/utils";

export async function GET(req: Request) {
  const weightData = await getWorkoutDbData();
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
