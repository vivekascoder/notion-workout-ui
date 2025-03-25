import { getPullWorkoutData } from "@/lib/utils";

export async function GET(req: Request) {
  const weightData = await getPullWorkoutData();
  return new Response(JSON.stringify(weightData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
