import { getPushWorkoutData } from "@/lib/utils";

export async function GET(req: Request) {
  const data = await getPushWorkoutData();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
