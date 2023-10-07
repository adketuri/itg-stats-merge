import { XMLParser, XMLBuilder, XMLValidator} from "fast-xml-parser";
import fs from 'fs';
import { SaveXML } from "./types";

console.log("START")
let ecfa: SaveXML;
let itg: SaveXML;

function combine(){
    itg.Stats.GeneralData.TotalSessions += ecfa.Stats.GeneralData.TotalSessions;
    itg.Stats.GeneralData.TotalSessionSeconds += ecfa.Stats.GeneralData.TotalSessionSeconds;
    itg.Stats.GeneralData.TotalCaloriesBurned += ecfa.Stats.GeneralData.TotalCaloriesBurned;
    itg.Stats.GeneralData.TotalDancePoints += ecfa.Stats.GeneralData.TotalDancePoints;
    itg.Stats.GeneralData.TotalTapsAndHolds += ecfa.Stats.GeneralData.TotalTapsAndHolds;
    itg.Stats.GeneralData.TotalJumps += ecfa.Stats.GeneralData.TotalJumps;
    itg.Stats.GeneralData.TotalHolds += ecfa.Stats.GeneralData.TotalHolds;
    itg.Stats.GeneralData.TotalRolls += ecfa.Stats.GeneralData.TotalRolls;
    itg.Stats.GeneralData.TotalMines += ecfa.Stats.GeneralData.TotalMines;
    itg.Stats.GeneralData.TotalHands += ecfa.Stats.GeneralData.TotalHands;
    itg.Stats.GeneralData.TotalLifts += ecfa.Stats.GeneralData.TotalLifts;
    Object.keys(itg.Stats.GeneralData.NumSongsPlayedByDifficulty).forEach((k) => itg.Stats.GeneralData.NumSongsPlayedByDifficulty[k] += ecfa.Stats.GeneralData.NumSongsPlayedByDifficulty[k]);
    itg.Stats.GeneralData.NumTotalSongsPlayed += ecfa.Stats.GeneralData.NumTotalSongsPlayed
    Object.keys(itg.Stats.GeneralData.NumStagesPassedByGrade).forEach((k) => itg.Stats.GeneralData.NumStagesPassedByGrade[k] += ecfa.Stats.GeneralData.NumStagesPassedByGrade[k]);

    // itg.Stats.GeneralData.NumSongsPlayedByDifficulty.Challenge += ecfa.Stats.GeneralData.TotalTapsAndHolds;








}

const opts = {ignoreAttributes: false, attributeNamePrefix : "@_", allowBooleanAttributes: true}
const parser = new XMLParser(opts);

fs.readFile('/Users/andrew/itg-stats-merge/input/ECFA-Stats.xml', 'utf8', (err, data) => {
    if (err) { console.error(err); return; }
    ecfa = parser.parse(data, opts);
    console.log(JSON.stringify(ecfa));
    fs.readFile('/Users/andrew/itg-stats-merge/input/Stats.xml', 'utf8', (err, data) => {
        if (err) { console.error(err); return; }
        itg = parser.parse(data, opts);
        
        combine();

        const builder = new XMLBuilder(opts);
        const xmlContent = builder.build(itg);
        fs.writeFile("out.xml", xmlContent, () => {
            console.log("DONE!")
        })
        // console.log(data);
  });
});