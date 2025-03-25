"use client";

import Image from "next/image";
import { Client } from "@notionhq/client";
import { useEffect } from "react";
import NotionGraphUi from "./components/notion-graph-ui";
import { ModeToggle } from "./components/model-toggle";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex items-center justify-between w-full py-5 md:px-0 px-2">
          <h1 className="text-3xl font-semibold">📊 Notion workout logs UI</h1>
          <ModeToggle />
        </div>
        <NotionGraphUi />
      </main>
      <footer className="mt-10 row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a href="https://vivek.ink" className="m-2">
          Made by: @vivek
        </a>
      </footer>
    </div>
  );
}
