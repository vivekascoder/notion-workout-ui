"use client";
import NotionGraphUi from "../components/notion-graph-ui";
import { ModeToggle } from "../components/model-toggle";

export default function Home() {
  return (
    <div className="">
      <NotionGraphUi />

      <div>
        <footer className="mt-10 row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          <a href="https://vivek.ink" className="m-2">
            Made by: @vivek
          </a>
        </footer>
      </div>
    </div>
  );
}
