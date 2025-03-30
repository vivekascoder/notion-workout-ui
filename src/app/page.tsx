"use client";
import NotionGraphUi from "../components/notion-graph-ui";
import { ModeToggle } from "../components/model-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Book } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      <NotionGraphUi />
    </div>
  );
}
