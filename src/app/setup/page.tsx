"use client";

import NotionTokenForm from "@/components/notion-token-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/state";
import Link from "next/link";

export default function SetupPage({}: {}) {
  const { notionToken } = useStore.getState();
  const setup = useStore((state) => state.setup);
  const hasHydrated = useStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return <Skeleton className="h-40 rounded-md w-full" />;
  }
  return (
    <div className="w-full">
      <div className="w-full px-4">
        <h1 className="text-xl font-semibold mb-5"># Setup for ur workouts</h1>

        <div className="space-y-3 break-words">
          <p>
            + Clone the notion template from here:{" "}
            <Link
              className="underline font-semibold text-green-500"
              href="https://vivekascoder.notion.site/1c239909ecfc80dba883d445b26c599d?v=1c239909ecfc80428c15000c149c236b&pvs=74"
            >
              workout db template
            </Link>
          </p>
          <p>
            + generate a private integration on notion and get the notion token.
          </p>
          <p>
            + go to ur copy of workout db and add the integration by clicking on
            three dot on top right then connection then selection the
            integration.{" "}
          </p>
          <p>
            + let's say this is ur URL
            https://www.notion.so/vivekascoder/1c239909ecfc80dba883d445b26c599d?v=1c339909ecfc803d83da000cfb02fc0b,
            then database if is the first alphanumeric string before ?.
          </p>
          <p>
            + Add ur Notion token along with the database id in the following
            form.
          </p>
          <p>
            + And you are good to go, now, track.vivek.ink is dedicated for ur
            workout logs and helping to take ur progress to the moon.
          </p>

          <p>
            + you can reset the credentials by going to the setup page from the
            footer.
          </p>

          <p>
            + If you wanna fund or suppor the project and it's furthur
            development consider donating to the following addresses.
          </p>

          <p>
            + <strong>SOL:</strong>{" "}
            <code className="font-mono hover:border-b-2 border-gray-500 cursor-pointer">
              BzGc9ojK3GXuRPGsRZgMFpdYZmY2cMdmhER7SHT19wgM
            </code>
            <br />+ <strong>ETH:</strong>{" "}
            <code className="font-mono hover:border-b-2 border-gray-500 cursor-pointer">
              0xd4bBBab281e64Ad7A81A49Ac3741Ba13749A8929
            </code>{" "}
            <br />
          </p>
        </div>

        <br />
        <br />

        {notionToken ? (
          <>
            <p>Reset the credentials</p>
            <Button className="mt-3" onClick={() => setup("", "")}>
              {" "}
              <Link href="/setup">Reset credentials</Link>
            </Button>
          </>
        ) : (
          <NotionTokenForm />
        )}
      </div>
    </div>
  );
}
