import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MadeThisToLift: Notion Workout Tracker",
    short_name: "MadeThisToLift",
    description:
      "Track workouts in Notion and visualize progress with powerful insights",
    start_url: "/",
    display: "standalone",
    background_color: "#00000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
