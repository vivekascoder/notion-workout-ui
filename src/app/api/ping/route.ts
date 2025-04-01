import { getWorkoutExercisesForToken } from "@/lib/utils";
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

  const resp = await getWorkoutExercisesForToken(notionToken, databaseId);

  return new Response(JSON.stringify({ success: true, data: resp }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
