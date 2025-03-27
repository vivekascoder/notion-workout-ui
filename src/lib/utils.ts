import { Client } from "@notionhq/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import "dotenv/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export async function getPages() {
  const r = await notion.databases.query({
    database_id: "1c039909ecfc80e58c88c700d74e98a0",
  });
  return r;
}

export async function getPullWorkoutData() {
  return await getSetsLogs(databases.pullWorkout);
}

const getSetsLogs = async (databaseId: string) => {
  const r = await notion.databases.query({
    database_id: databaseId,
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

export async function getWorkoutDbData() {
  return getSetsLogs(databases.workoutDb);
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

    // console.log(obj);
  }

  return formatted;
}
export const modes = ["max weight", "total weight", "max set"] as const;
export type TMode = (typeof modes)[number];

export const parseLog = (log: string, mode: TMode) => {
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
    return v;
  } else if (mode === "max weight") {
    return sets.reduce((acc, cur) => {
      return cur.weight > acc ? cur.weight : acc;
    }, 0);
  } else if (mode === "max set") {
    return sets.reduce((acc, cur) => {
      return cur.reps * cur.weight > acc ? cur.reps * cur.weight : acc;
    }, 0);
  } else {
    return 0;
  }
};

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
