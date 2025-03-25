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

// write main function, call it and log getWEightData()

async function main() {}

main();
