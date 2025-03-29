// show the slug from the dynamic url in h1
import {
  IPullData,
  IWorkoutApiResp,
  PullWoroutLineChart,
} from "@/components/notion-graph-ui";
import { ModeToggle } from "@/components/model-toggle";
import VisualizeExercise from "@/components/VisualizeExercise";

export default async function VisualizePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exercise = slug.replaceAll("%20", " ");

  return (
    <div className="w-full">
      <div className="w-full">
        <VisualizeExercise exercise={exercise} />
      </div>
      <footer className="mt-10 row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a href="https://vivek.ink" className="m-2">
          Made by: @vivek
        </a>
      </footer>
    </div>
  );
}
