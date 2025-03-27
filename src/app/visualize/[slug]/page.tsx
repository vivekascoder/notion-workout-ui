// show the slug from the dynamic url in h1
import {
  IPullData,
  IWorkoutApiResp,
  PullWoroutLineChart,
} from "@/components/notion-graph-ui";
import { ModeToggle } from "@/components/model-toggle";
import VisualizeExercise from "@/components/VisualizePage";

export default async function VisualizePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exercise = slug;

  return (
    <div className="max-w-4xl mx-auto">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex items-center justify-between w-full py-5 md:px-0 px-2">
          <h1 className="text-3xl font-semibold">
            {`📈 Visualize ${exercise}`}{" "}
          </h1>
          <ModeToggle />
        </div>

        <div className="w-full">
          <VisualizeExercise exercise={exercise} />
        </div>
      </main>
      <footer className="mt-10 row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a href="https://vivek.ink" className="m-2">
          Made by: @vivek
        </a>
      </footer>
    </div>
  );
}
