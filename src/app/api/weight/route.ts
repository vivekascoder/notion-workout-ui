import { getWeightData } from "@/lib/utils";

export async function GET(req: Request) {
  const weightData = await getWeightData();
  return new Response(JSON.stringify(weightData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
