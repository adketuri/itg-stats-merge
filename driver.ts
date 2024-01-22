import { readStatsXml, combine } from ".";
import * as fs from "fs";
import { SaveXML } from "./types";

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
