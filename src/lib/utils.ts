import { Client } from "@notionhq/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import "dotenv/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { redirect } from "next/navigation";

export async function navigate(path: string) {
  redirect(path);
}

export const databases = {
  pullWorkout: "1c039909ecfc80e58c88c700d74e98a0",
  weight: "1c039909ecfc801cbe6bc034bfb501eb",
  pushWorkout: "1c039909ecfc80be8bb7dabde3f09529",
  workoutDb: "1c239909ecfc80dba883d445b26c599d",
};

export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function getDatabase() {
  const databaseId = "1c039909ecfc80e58c88c700d74e98a0";
  const response = await notion.databases.retrieve({
    database_id: databaseId,
  });
  return response;
}

export async function getDatabaseInitTest(
  notionToken: string,
  databaseId: string
) {
  const notion = new Client({
    auth: notionToken,
  });
  const response = await notion.databases.retrieve({
    database_id: databaseId,
  });
  return response;
}

export async function getPages() {
  const r = await notion.databases.query({
    database_id: "1c039909ecfc80e58c88c700d74e98a0",
  });
  return r;
}

export async function getPullWorkoutData() {
  return await getSetsLogs(databases.pullWorkout);
}
type TSorts = { property: string; direction: "ascending" | "descending" }[];
type TFilter = {
  property: string;
  select: { equals: string };
};

const getSetsLogs = async (
  databaseId: string,
  sorts?: TSorts,
  filter?: TFilter
) => {
  const r = await notion.databases.query({
    database_id: databaseId,
    sorts: sorts,
    filter: filter,
  });
  const formatted: { date: string; exercise: string; sets: string }[] = [];

  for (const item of r.results) {
    const obj: { [key: string]: any } = {};

    Object.entries((item as any).properties).forEach(
      ([propertyName, propertyValue]) => {
        obj[propertyName] = propertyValue;
      }
    );

    if (!obj.date.date) {
      continue;
    }

    formatted.push({
      date: obj.date.date.start,
      exercise: obj.exercise.select.name,
      sets: getLogFromField(obj.log),
    });
  }

  return formatted;
};

export function getLogFromField(v: any) {
  let val: string;

  if (v.type === "rich_text") {
    val = v.rich_text.length > 0 ? v.rich_text[0].plain_text : "";
  } else if (v.type === "number") {
    val = v.number.toString();
  } else if (v.type === "title") {
    val = v.title.length > 0 ? v.title[0].plain_text : "";
  } else if (v.type === "select") {
    val = v.select.name;
  } else {
    val = "";
  }
  return val;
}

export async function getPushWorkoutData() {
  return getSetsLogs(databases.pushWorkout);
}

export async function getWorkoutDbData(sorts?: TSorts, filter?: TFilter) {
  return getSetsLogs(databases.workoutDb, sorts, filter);
}

export async function getWorkoutDbDataForToken(
  notionToken: string,
  databaseId: string,
  sorts?: TSorts,
  filter?: TFilter
) {
  const notion = new Client({
    auth: notionToken,
  });
  return getSetsLogs(databaseId, sorts, filter);
}

export async function getWorkoutExercises() {
  const response = await notion.databases.retrieve({
    database_id: databases.workoutDb,
  });
  let exercises: string[] = [];

  Object.entries((response as any).properties).forEach(
    ([propertyName, propertyValue]) => {
      if (propertyName === "exercise") {
        exercises = (propertyValue as any).select.options.map(
          (o: any) => o.name
        );
      }
    }
  );
  return exercises;
}

export async function getWorkoutExercisesForToken(
  notionToken: string,
  databaseId: string
) {
  const notion = new Client({
    auth: notionToken,
  });

  const response = await notion.databases.retrieve({
    database_id: databaseId,
  });
  let exercises: string[] = [];

  Object.entries((response as any).properties).forEach(
    ([propertyName, propertyValue]) => {
      if (propertyName === "exercise") {
        exercises = (propertyValue as any).select.options.map(
          (o: any) => o.name
        );
      }
    }
  );
  return exercises;
}

export async function getWeightData() {
  const data = await notion.databases.query({
    database_id: databases.weight,
  });

  const formatted: { date: string; weight: number }[] = [];

  for (const item of data.results) {
    // Object.entries(database.properties).forEach(
    //   ([propertyName, propertyValue]) => {
    //     console.log(`${propertyName}: ${propertyValue.type}`);
    //   }
    // );

    const obj: { [key: string]: any } = {};

    Object.entries((item as any).properties).forEach(
      ([propertyName, propertyValue]) => {
        obj[propertyName] = propertyValue;
      }
    );

    formatted.push({
      date: obj.Date.date.start,
      weight: obj.weight.number,
    });
  }

  return formatted;
}
export const modes = ["max weight", "total weight", "max set"] as const;
export type TMode = (typeof modes)[number];

export const parseLog = (
  log: string,
  mode: TMode
): {
  value: number;
  visual: string;
  sets: {
    reps: number;
    weight: number;
  }[];
} => {
  const sets = log.split(" ").map((set) => {
    const d = set.split(".");
    const weight = parseInt(d[0]);
    const reps = parseInt(d[1]);
    return {
      reps,
      weight,
    };
  });

  if (mode === "total weight") {
    const v = sets.reduce((acc, cur) => {
      return acc + cur.reps * cur.weight;
    }, 0);
    return {
      value: v,
      visual: log,
      sets,
    };
  } else if (mode === "max weight") {
    const maxW = sets.reduce((acc, cur) => {
      return cur.weight > acc ? cur.weight : acc;
    }, 0);
    return {
      value: maxW,
      visual: maxW.toString(),
      sets,
    };
  } else if (mode === "max set") {
    const maxS = sets.reduce(
      (acc, cur) => {
        if (cur.reps * cur.weight > acc.v) {
          return {
            v: cur.reps * cur.weight,
            set: {
              reps: cur.reps,
              weight: cur.weight,
            },
          };
        } else {
          return acc;
        }
      },
      { v: 0, set: { reps: 0, weight: 0 } }
    );
    return {
      value: maxS.v,
      visual: `${maxS.set.weight}x${maxS.set.reps}`,
      sets,
    };
  }
  return {
    value: 0,
    visual: "",
    sets,
  };
};
export type TFilteredChartData = {
  date: string;
  value: number;
  visual: string;
}[];

export function getMaxValue(data: TFilteredChartData) {
  // clone the data
  const dataClone: TFilteredChartData = JSON.parse(JSON.stringify(data));
  return dataClone.sort((a, b) => b.value - a.value)[0];
}
export function getMinValue(data: TFilteredChartData) {
  const dataClone: TFilteredChartData = JSON.parse(JSON.stringify(data));
  return dataClone.sort((a, b) => a.value - b.value)[0];
}

export function getPnLDaily(data: TFilteredChartData) {
  if (data.length <= 1) return "0"; // No PNL possible with 0 or 1 data point
  return (
    (data[data.length - 1].value / data[data.length - 2].value - 1) *
    100
  ).toFixed(2);
}

// export function getWeightPRs(data: TFilteredChartData) {
//   if (data.length <= 1) return []; // No PR possible with 0 or 1 data point

//   // weight and max reps
//   const prs: { [key: number]: number } = {};
//   for (const d of data) {

//   }
// }

export function getStreak(data: TFilteredChartData) {
  if (data.length <= 1) return 0; // No streak possible with 0 or 1 data point
  let streak = 0;
  let prev = data[0].value;
  for (let i = 1; i < data.length; i++) {
    if (data[i].value > prev) {
      streak++;
    } else {
      streak = 0;
    }
    prev = data[i].value;
  }
  return streak;
}

// write main function, call it and log getWEightData()

async function main() {
  // console.log(await getPullWorkoutData());
  // console.log(parseLog("10.100 10.100 10.100", "max weigh"));
  // console.log(
  //   await await notion.pages.retrieve({
  //     page_id: "1c239909-ecfc-8016-8954-fe5fa08d2ddd",
  //   })
  // );
  // console.log();
  // const response = await getWorkoutDbData();
  // const response = await notion.databases.retrieve({
  //   database_id: databases.workoutDb,
  // });
  // const response = await getWorkoutExercises();
  // const response = await notion.blocks.children.list({
  //   block_id: "1c239909-ecfc-8016-8954-fe5fa08d2ddd",
  //   page_size: 50,
  // });
  // console.log(JSON.stringify(response, null, 2));
  // console.log(await getSetsLogs(databases.pullWorkout));
}

main();
