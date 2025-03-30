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
    </div>
  );
}
