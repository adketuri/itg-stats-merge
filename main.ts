import { XMLParser, XMLBuilder, XMLValidator} from "fast-xml-parser";
import fs from 'fs';
import { HighScoreElement, SaveXML, SongScores, SongScoresSong, Step } from "./types";

console.log("START")
let ecfa: SaveXML;
let itg: SaveXML;

function addHighscores(toAdd: HighScoreElement[] | HighScoreElement, faModeToItgMode: boolean): HighScoreElement[]{
    let newHs: HighScoreElement[] = []
    if (Array.isArray(toAdd)){
        toAdd.forEach((ih) => newHs.push(ih))
    } else {
        newHs.push(toAdd)
    }
    return newHs
}

function mergeHighScores(itgHs: HighScoreElement[] | HighScoreElement, existingHs: HighScoreElement[] | HighScoreElement): HighScoreElement[]{
    let newHs = [...addHighscores(itgHs, false), ...addHighscores(existingHs, true)]
    // TODO sort
    return newHs
}

function mergeSteps(itgStep: Step, existingStep: Step): Step{
    let newStep: Step = { HighScoreList: { NumTimesPlayed: 0, LastPlayed: "", HighGrade: undefined, HighScore: []}, "@_Difficulty": itgStep["@_Difficulty"],  "@_StepsType": itgStep["@_StepsType"]}
    newStep.HighScoreList.NumTimesPlayed = itgStep.HighScoreList.NumTimesPlayed + existingStep.HighScoreList.NumTimesPlayed;
    newStep.HighScoreList.HighGrade = itgStep.HighScoreList.HighGrade < existingStep.HighScoreList.HighGrade ? existingStep.HighScoreList.HighGrade : itgStep.HighScoreList.HighGrade
    newStep.HighScoreList.LastPlayed = itgStep.HighScoreList.LastPlayed < existingStep.HighScoreList.LastPlayed ? existingStep.HighScoreList.LastPlayed : itgStep.HighScoreList.LastPlayed
    newStep.HighScoreList.HighScore = mergeHighScores(itgStep.HighScoreList.HighScore, existingStep.HighScoreList.HighScore)
    return newStep
}

function mergeSongs(ecfaSong: SongScoresSong, itgSong?: SongScoresSong): SongScoresSong {
    // kill the FA+ window
    // HighScore is either an array or single element
    let newSongs = { Steps: [], "@_Dir": ecfaSong["@_Dir"]} 

    if (Array.isArray(ecfaSong.Steps)){
        ecfaSong.Steps.forEach((s: Step)=> newSongs.Steps.push(s))
    } else {
        newSongs.Steps.push(ecfaSong.Steps)
    }
    if (itgSong){
        if (Array.isArray(itgSong.Steps)){
            itgSong.Steps.forEach((itgStep: Step) => {
                // TODO combine me v
                let existingStep: Step = newSongs.Steps.find((newStep: Step) => newStep["@_Difficulty"] === itgStep["@_Difficulty"] && newStep["@_StepsType"] === itgStep["@_StepsType"])
                if (!existingStep){
                    newSongs.Steps.push(itgStep)
                } else {
                    newSongs.Steps[newSongs.Steps.indexOf(existingStep)] = mergeSteps(itgStep, existingStep)
                }
            })
        } else {
            // TODO combine me ^
            let existingStep: Step = newSongs.Steps.find((newStep: Step) => newStep["@_Difficulty"] === itgSong.Steps["@_Difficulty"] && newStep["@_StepsType"] === itgSong.Steps["@_StepsType"])
            if (!existingStep){
                newSongs.Steps.push(itgSong.Steps)
            } else {
                newSongs.Steps[newSongs.Steps.indexOf(existingStep)] = mergeSteps(itgSong.Steps, existingStep)
            }
        }
    }
    // if (Array.isArray(ecfaSong.Steps.HighScoreList.HighScore)){
    //     ecfaSong.Steps.HighScoreList.HighScore.forEach(hs => {
    //         hs.TapNoteScores.W1 = hs.TapNoteScores.W1 + hs.TapNoteScores.W2;
    //         hs.TapNoteScores.W2 = hs.TapNoteScores.W3;
    //         hs.TapNoteScores.W3 = hs.TapNoteScores.W4;
    //         hs.TapNoteScores.W4 = hs.TapNoteScores.W5;
    //         hs.TapNoteScores.W5 = 0;
    //     })
    // } else {
    //     ecfaSong.Steps.HighScoreList.HighScore.TapNoteScores.W1 = ecfaSong.Steps.HighScoreList.HighScore.TapNoteScores.W1 + ecfaSong.Steps.HighScoreList.HighScore.TapNoteScores.W2;
    //     ecfaSong.Steps.HighScoreList.HighScore.TapNoteScores.W2 = ecfaSong.Steps.HighScoreList.HighScore.TapNoteScores.W3;
    //     ecfaSong.Steps.HighScoreList.HighScore.TapNoteScores.W3 = ecfaSong.Steps.HighScoreList.HighScore.TapNoteScores.W4;
    //     ecfaSong.Steps.HighScoreList.HighScore.TapNoteScores.W4 = ecfaSong.Steps.HighScoreList.HighScore.TapNoteScores.W5;
    //     ecfaSong.Steps.HighScoreList.HighScore.TapNoteScores.W5 = 0;
    // }
    // if (itgSong){
    //     if (Array.isArray(itgSong.Steps.HighScoreList.HighScore)) { 
    //         if (Array.isArray(ecfaSong.Steps.HighScoreList.HighScore)){
    //             itgSong.Steps.HighScoreList.HighScore.forEach(s => ecfaSong.Steps.HighScoreList.HighScore.push(s))
    //         } else {
    //             ecfaSong.Steps.HighScoreList.HighScore = itgSong.Steps.HighScoreList.HighScore
    //         }
    //     } else {
    //         itgSong.Steps.HighScoreList.HighScore = ecfaSong.Steps.HighScoreList.HighScore
    //     }
        
    //     if (Array.isArray(ecfaSong.Steps.HighScoreList.HighScore)){
    //         ecfaSong.Steps.HighScoreList.HighScore.forEach(hs => {
    //             console.log("Compare ", hs.Grade, ecfaSong.Steps.HighScoreList.HighGrade )
    //             if (hs.Grade < ecfaSong.Steps.HighScoreList.HighGrade){
    //                 ecfaSong.Steps.HighScoreList.HighGrade = hs.Grade
    //                 console.log("  New is ", hs.Grade)
    //             }
    //         })
    //     }
    //     ecfaSong.Steps.HighScoreList.NumTimesPlayed = ecfaSong.Steps.HighScoreList.HighScore.length
    // }
    return newSongs;
    
    // return ecfaSong
}

// puts `ecfa` scores into `itg`
// ideally this would return a new array but for now we'll just mutate `itg`
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

    // build a new array consisting of all our song scores we want to add back into `itg`
    let mergedSongs: Array<SongScoresSong> = new Array();
    for (let i = ecfa.Stats.SongScores.Song.length - 1; i >= 0; i--){
        const ecfaSong = ecfa.Stats.SongScores.Song[i];
        if (ecfaSong["@_Dir"] === "Songs/ECFA 2021 (09s Day 1)/drop pop candy (SX 9)/"){
            console.log(ecfaSong["@_Dir"])
        }
        const matchingItg = itg.Stats.SongScores.Song.find(s => s["@_Dir"] === ecfaSong["@_Dir"])
        if (matchingItg){
            // we have a matching `itg` song, so we'll need to merge and push to our mergedSongs array
            mergedSongs.push(mergeSongs(ecfaSong, matchingItg))
            // remove the matching itg song from the original array, we'll re-add after we're done with the newly-merged stats
            itg.Stats.SongScores.Song = itg.Stats.SongScores.Song.filter(s => s["@_Dir"] !== matchingItg["@_Dir"])
        } else {
            // no merging required, this song isn't in `itg`
            mergedSongs.push(ecfaSong);
        }
    }
    mergedSongs.forEach(s => itg.Stats.SongScores.Song.push(s))
}

const opts = {ignoreAttributes: false, attributeNamePrefix : "@_", allowBooleanAttributes: true}
const parser = new XMLParser(opts);

fs.readFile('/Users/andrew/itg-stats-merge/input/ECFA-Stats.xml', 'utf8', (err, data) => {
    if (err) { console.error(err); return; }
    ecfa = parser.parse(data, opts);
    fs.readFile('/Users/andrew/itg-stats-merge/input/Stats.xml', 'utf8', (err, data) => {
        if (err) { console.error(err); return; }
        itg = parser.parse(data, opts);
        combine(); // this mutates `itg`

        const builder = new XMLBuilder(opts);
        const xmlContent = builder.build(itg);
        fs.writeFile("output/Stats-Merged.json", JSON.stringify(itg), ()=> console.log("DONE combined json"));
        fs.writeFile("output/Stats-Merged.xml", xmlContent, () => console.log("DONE merged xml"))
  });
});