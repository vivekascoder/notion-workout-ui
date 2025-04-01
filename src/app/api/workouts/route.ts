import {
  getWeightData,
  getWorkoutDbDataForToken,
  getWorkoutExercises,
  getWorkoutExercisesForToken,
} from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const notionToken = searchParams.get("notionToken");
  const databaseId = searchParams.get("databaseId");

  if (!notionToken || !databaseId) {
    return new Response(
      JSON.stringify({ error: "Notion token and database ID are required." }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const exercise = searchParams.get("exercise");

  const weightData = await getWorkoutDbDataForToken(
    notionToken,
    databaseId,
    [{ direction: "ascending", property: "date" }],
    exercise
      ? { property: "exercise", select: { equals: exercise } }
      : undefined
  );
  const exercisesName = await getWorkoutExercisesForToken(
    notionToken,
    databaseId
  );
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
