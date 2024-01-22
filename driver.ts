import { combine, parseStatsXml } from ".";
import * as fs from "fs";
import { SaveXML } from "./types";

function readStatsXml(path: string) {
  try {
    const fileContents = fs.readFileSync(path, "utf8");
    return parseStatsXml(fileContents)
  } catch {
    console.log(`Error: Failed to parse ${path}`);
    return null;
  }
}

function convert() {
  // validate args
  if (process.argv.length !== 4) {
    console.log(
      "Usage: npm run convert <Stats.xml path> <ECFA-Stats.xml path>"
    );
    return;
  }

  // read XML files into objects
  const itg: SaveXML | null = readStatsXml(process.argv[2]);
  const ecfa: SaveXML | null = readStatsXml(process.argv[3]);
  if (!itg || !ecfa) {
    return;
  }

  const combinedXml = combine(itg, ecfa);
  fs.writeFileSync("Stats-Merged.xml", combinedXml);
}

convert();
