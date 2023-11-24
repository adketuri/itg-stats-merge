import { XMLParser, XMLBuilder } from "fast-xml-parser";
import * as fs from "fs";
import { HighScoreElement, SaveXML, SongScoresSong, Step } from "./types";
import { xmlValueToArray } from "./utils";

function demoteScore(hs: HighScoreElement): void {
  if (!hs) {
    // there's actually a world where there's a played entry but there's no scores yet, we can just return
    return;
  }
  hs.TapNoteScores.W1 = hs.TapNoteScores.W1 + hs.TapNoteScores.W2;
  hs.TapNoteScores.W2 = hs.TapNoteScores.W3;
  hs.TapNoteScores.W3 = hs.TapNoteScores.W4;
  hs.TapNoteScores.W4 = hs.TapNoteScores.W5;
  hs.TapNoteScores.W5 = 0;
}

function mergeSteps(itgStep: Step, existingStep?: Step): Step {
  if (!existingStep) {
    return itgStep;
  }

  let newStep: Step = {
    HighScoreList: {
      NumTimesPlayed: 0,
      LastPlayed: "",
      HighGrade: undefined,
      HighScore: [],
    },
    "@_Difficulty": itgStep["@_Difficulty"],
    "@_StepsType": itgStep["@_StepsType"],
  };

  newStep.HighScoreList.NumTimesPlayed =
    itgStep.HighScoreList.NumTimesPlayed +
    existingStep.HighScoreList.NumTimesPlayed;

  newStep.HighScoreList.HighGrade =
    itgStep.HighScoreList.HighGrade < existingStep.HighScoreList.HighGrade
      ? existingStep.HighScoreList.HighGrade
      : itgStep.HighScoreList.HighGrade;

  newStep.HighScoreList.LastPlayed =
    itgStep.HighScoreList.LastPlayed < existingStep.HighScoreList.LastPlayed
      ? existingStep.HighScoreList.LastPlayed
      : itgStep.HighScoreList.LastPlayed;

  newStep.HighScoreList.HighScore = [
    ...xmlValueToArray(itgStep.HighScoreList.HighScore),
    ...xmlValueToArray(existingStep.HighScoreList.HighScore),
  ].sort((a, b) => {
    if (b.PercentDP !== a.PercentDP) {
      return b.PercentDP - a.PercentDP;
    }
    return b.DateTime.localeCompare(a.DateTime);
  });

  return newStep;
}

function mergeSongs(
  ecfaSong: SongScoresSong,
  itgSong?: SongScoresSong
): SongScoresSong {
  if (!itgSong) {
    return ecfaSong;
  }

  // kill the FA+ window
  // HighScore is either an array or single element
  let newSongs = {
    Steps: xmlValueToArray(ecfaSong.Steps),
    "@_Dir": ecfaSong["@_Dir"],
  };

  const itgSteps = xmlValueToArray(itgSong.Steps);

  itgSteps.forEach((itgStep: Step) => {
    const existingStep: Step | undefined = newSongs.Steps.find(
      (newStep: Step) =>
        newStep["@_Difficulty"] === itgStep["@_Difficulty"] &&
        newStep["@_StepsType"] === itgStep["@_StepsType"]
    );
    const existingStepIndex = newSongs.Steps.indexOf(existingStep);
    const mergedSteps = mergeSteps(itgStep, existingStep);
    if (!existingStep) {
      newSongs.Steps.push(mergedSteps);
    } else {
      newSongs.Steps[existingStepIndex] = mergedSteps;
    }
  });

  return newSongs;
}

// puts `ecfa` scores into `itg`
// ideally this would return a new array but for now we'll just mutate `itg`
function combine() {
  itg.Stats.GeneralData.TotalSessions += ecfa.Stats.GeneralData.TotalSessions;
  itg.Stats.GeneralData.TotalGameplaySeconds +=
    ecfa.Stats.GeneralData.TotalGameplaySeconds;

  itg.Stats.GeneralData.TotalSessionSeconds +=
    ecfa.Stats.GeneralData.TotalSessionSeconds;

  itg.Stats.GeneralData.TotalCaloriesBurned +=
    ecfa.Stats.GeneralData.TotalCaloriesBurned;

  itg.Stats.GeneralData.TotalDancePoints +=
    ecfa.Stats.GeneralData.TotalDancePoints;

  itg.Stats.GeneralData.TotalTapsAndHolds +=
    ecfa.Stats.GeneralData.TotalTapsAndHolds;

  itg.Stats.GeneralData.TotalJumps += ecfa.Stats.GeneralData.TotalJumps;
  itg.Stats.GeneralData.TotalHolds += ecfa.Stats.GeneralData.TotalHolds;
  itg.Stats.GeneralData.TotalRolls += ecfa.Stats.GeneralData.TotalRolls;
  itg.Stats.GeneralData.TotalMines += ecfa.Stats.GeneralData.TotalMines;
  itg.Stats.GeneralData.TotalHands += ecfa.Stats.GeneralData.TotalHands;
  itg.Stats.GeneralData.TotalLifts += ecfa.Stats.GeneralData.TotalLifts;

  itg.Stats.GeneralData.NumSongsPlayedByPlayMode.Regular +=
    ecfa.Stats.GeneralData.NumSongsPlayedByPlayMode.Regular;

  itg.Stats.GeneralData.NumSongsPlayedByStyle.Style.forEach((s) => {
    const ecfaNumSongsPlayedByStyle =
      ecfa.Stats.GeneralData.NumSongsPlayedByStyle.Style.find(
        (s2) => s2["@_Game"] === s["@_Game"] && s2["@_Style"] === s["@_Style"]
      );
    if (!ecfaNumSongsPlayedByStyle) {
      return;
    }
    s["#text"] += ecfaNumSongsPlayedByStyle["#text"];
  });

  // these object.keys assume both xml files have all keys, because i'm lazy
  Object.keys(itg.Stats.GeneralData.NumSongsPlayedByDifficulty).forEach(
    (k) =>
      (itg.Stats.GeneralData.NumSongsPlayedByDifficulty[k] +=
        ecfa.Stats.GeneralData.NumSongsPlayedByDifficulty[k])
  );

  Object.keys(itg.Stats.GeneralData.NumSongsPlayedByMeter).forEach(
    (k) =>
      (itg.Stats.GeneralData.NumSongsPlayedByMeter[k] +=
        ecfa.Stats.GeneralData.NumSongsPlayedByMeter[k])
  );

  itg.Stats.GeneralData.NumTotalSongsPlayed +=
    ecfa.Stats.GeneralData.NumTotalSongsPlayed;

  Object.keys(itg.Stats.GeneralData.NumStagesPassedByGrade).forEach(
    (k) =>
      (itg.Stats.GeneralData.NumStagesPassedByGrade[k] +=
        ecfa.Stats.GeneralData.NumStagesPassedByGrade[k])
  );

  // build a new array consisting of all our song scores we want to add back into `itg`
  let mergedSongs: Array<SongScoresSong> = new Array();
  for (let i = ecfa.Stats.SongScores.Song.length - 1; i >= 0; i--) {
    const ecfaSong = ecfa.Stats.SongScores.Song[i];
    const ecfaSongSteps = xmlValueToArray(ecfaSong.Steps);

    ecfaSongSteps.forEach((stp: Step) => {
      xmlValueToArray(stp.HighScoreList.HighScore).forEach(demoteScore);
    });

    const matchingItg = itg.Stats.SongScores.Song.find(
      (s) => s["@_Dir"] === ecfaSong["@_Dir"]
    );
    const mergedEcfaToItg = mergeSongs(ecfaSong, matchingItg);
    mergedSongs.push(mergedEcfaToItg);

    if (matchingItg) {
      // remove the matching itg song from the original array, we'll re-add after we're done with the newly-merged stats
      itg.Stats.SongScores.Song = itg.Stats.SongScores.Song.filter(
        (s) => s["@_Dir"] !== matchingItg["@_Dir"]
      );
    }
  }
  itg.Stats.SongScores.Song.push(...mergedSongs);
}

console.log("START");
let ecfa: SaveXML;
let itg: SaveXML;

const opts = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
};
const parser = new XMLParser(opts);

console.log("process", process.argv);
fs.readFile(
  process.argv.length > 3 ? process.argv[3] : "input/ECFA-Stats.xml",
  "utf8",
  (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    ecfa = parser.parse(data, opts);
    fs.readFile(
      process.argv.length > 2 ? process.argv[2] : "input/Stats.xml",
      "utf8",
      (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        itg = parser.parse(data, opts);
        combine(); // this mutates `itg`

        const builder = new XMLBuilder({ ...opts, format: true });
        const xmlContent = builder.build(itg);
        fs.writeFile(
          "output/Stats-Merged.json",
          JSON.stringify(itg, undefined, 2),
          () => console.log("DONE merged json")
        );
        fs.writeFile("output/Stats-Merged.xml", xmlContent, () =>
          console.log("DONE merged xml")
        );
      }
    );
  }
);
