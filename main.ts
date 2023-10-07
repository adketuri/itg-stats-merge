import { XMLParser, XMLBuilder, XMLValidator} from "fast-xml-parser";
import fs from 'fs';
import { SaveXML, SongScores, SongScoresSong } from "./types";

console.log("START")
let ecfa: SaveXML;
let itg: SaveXML;

function ecfaToItgSong(ecfaSong: SongScoresSong): SongScoresSong {
    return ecfaSong
}

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
    itg.Stats.GeneralData.NumSongsPlayedByPlayMode.Regular += ecfa.Stats.GeneralData.NumSongsPlayedByPlayMode.Regular;
    itg.Stats.GeneralData.NumSongsPlayedByStyle.Style.forEach(s => s["#text"] += ecfa.Stats.GeneralData.NumSongsPlayedByStyle.Style.find(s2 => s2["@_Game"] === s["@_Game"] && s2["@_Style"] === s["@_Style"])["#text"])
    // these object.keys assume both xml files have all keys, because i'm lazy
    Object.keys(itg.Stats.GeneralData.NumSongsPlayedByDifficulty).forEach((k) => itg.Stats.GeneralData.NumSongsPlayedByDifficulty[k] += ecfa.Stats.GeneralData.NumSongsPlayedByDifficulty[k]);
    Object.keys(itg.Stats.GeneralData.NumSongsPlayedByMeter).forEach((k) => itg.Stats.GeneralData.NumSongsPlayedByMeter[k] += ecfa.Stats.GeneralData.NumSongsPlayedByMeter[k]);
    itg.Stats.GeneralData.NumTotalSongsPlayed += ecfa.Stats.GeneralData.NumTotalSongsPlayed
    Object.keys(itg.Stats.GeneralData.NumStagesPassedByGrade).forEach((k) => itg.Stats.GeneralData.NumStagesPassedByGrade[k] += ecfa.Stats.GeneralData.NumStagesPassedByGrade[k]);

    // for each ecfa song
        // see if it exists in itg
            // if so merge and delete it
        // merge all the others
    let allSongs: Array<SongScoresSong> = new Array();

    for (let i = ecfa.Stats.SongScores.Song.length - 1; i >= 0; i--){
        const ecfaSong = ecfa.Stats.SongScores.Song[i];
        const matchingItg = itg.Stats.SongScores.Song.find(s => s["@_Dir"] === ecfaSong["@_Dir"])
        if (matchingItg){
            // matchingItg.Steps.
            ecfa.Stats.SongScores.Song[i] = undefined;
        }
    }

    // push remaining ecfa songs that didn't match itg
    ecfa.Stats.SongScores.Song.forEach(s => s && allSongs.push(ecfaToItgSong(s)))

    // itg.Stats.GeneralData.NumSongsPlayedByDifficulty.Challenge += ecfa.Stats.GeneralData.TotalTapsAndHolds;








}

const opts = {ignoreAttributes: false, attributeNamePrefix : "@_", allowBooleanAttributes: true}
const parser = new XMLParser(opts);

fs.readFile('/Users/andrew/itg-stats-merge/input/ECFA-Stats.xml', 'utf8', (err, data) => {
    if (err) { console.error(err); return; }
    ecfa = parser.parse(data, opts);
    fs.readFile('/Users/andrew/itg-stats-merge/input/Stats.xml', 'utf8', (err, data) => {
        if (err) { console.error(err); return; }
        itg = parser.parse(data, opts);
        
        combine();

        const builder = new XMLBuilder(opts);
        const xmlContent = builder.build(itg);
        fs.writeFile("out.json", JSON.stringify(ecfa), ()=> console.log("DONE json"));
        fs.writeFile("out.xml", xmlContent, () => console.log("DONE xml"))
  });
});