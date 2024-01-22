import { XMLParser, XMLBuilder } from "fast-xml-parser";
import * as fs from "fs";
import { cloneDeep } from "lodash";

import { HighScoreElement, NumSongsPlayedByDifficulty, SaveXML, SongScoresSong, Step } from "./types";
import { xmlValueToArray } from "./utils";

const PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  allowBooleanAttributes: true,
};

function demoteScore(hs?: HighScoreElement): void {
  if (!hs) {
    // there's actually a world where there's a played entry but there's no scores yet, we can just return
    return;
  }
  // repurpose <Score> to save the white counts
  hs.Score = hs.TapNoteScores.W2;
  // combine blue/white counts into a sum of fantastics
  hs.TapNoteScores.W1 = hs.TapNoteScores.W1 + hs.TapNoteScores.W2;
  // shift other judgments down
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
    itgStep.HighScoreList.HighGrade! < existingStep.HighScoreList.HighGrade!
      ? existingStep.HighScoreList.HighGrade
      : itgStep.HighScoreList.HighGrade;

  newStep.HighScoreList.LastPlayed =
    itgStep.HighScoreList.LastPlayed < existingStep.HighScoreList.LastPlayed
      ? existingStep.HighScoreList.LastPlayed
      : itgStep.HighScoreList.LastPlayed;

  newStep.HighScoreList.HighScore = [
    ...xmlValueToArray(itgStep.HighScoreList.HighScore!),
    ...xmlValueToArray(existingStep.HighScoreList.HighScore!),
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
  itgSong?: SongScoresSong | null
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
    const existingStepIndex = existingStep ? newSongs.Steps.indexOf(existingStep) : -1;
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
export function combine(itg: SaveXML, ecfa: SaveXML) {
  const combinedXml: SaveXML = cloneDeep(itg);

  combinedXml.Stats.GeneralData.TotalSessions +=
    ecfa.Stats.GeneralData.TotalSessions;
  combinedXml.Stats.GeneralData.TotalGameplaySeconds +=
    ecfa.Stats.GeneralData.TotalGameplaySeconds;

  combinedXml.Stats.GeneralData.TotalSessionSeconds +=
    ecfa.Stats.GeneralData.TotalSessionSeconds;

  combinedXml.Stats.GeneralData.TotalCaloriesBurned +=
    ecfa.Stats.GeneralData.TotalCaloriesBurned;

  combinedXml.Stats.GeneralData.TotalDancePoints +=
    ecfa.Stats.GeneralData.TotalDancePoints;

  combinedXml.Stats.GeneralData.TotalTapsAndHolds +=
    ecfa.Stats.GeneralData.TotalTapsAndHolds;

  combinedXml.Stats.GeneralData.TotalJumps += ecfa.Stats.GeneralData.TotalJumps;
  combinedXml.Stats.GeneralData.TotalHolds += ecfa.Stats.GeneralData.TotalHolds;
  combinedXml.Stats.GeneralData.TotalRolls += ecfa.Stats.GeneralData.TotalRolls;
  combinedXml.Stats.GeneralData.TotalMines += ecfa.Stats.GeneralData.TotalMines;
  combinedXml.Stats.GeneralData.TotalHands += ecfa.Stats.GeneralData.TotalHands;
  combinedXml.Stats.GeneralData.TotalLifts += ecfa.Stats.GeneralData.TotalLifts;

  combinedXml.Stats.GeneralData.NumSongsPlayedByPlayMode.Regular +=
    ecfa.Stats.GeneralData.NumSongsPlayedByPlayMode.Regular;

  const combinedSongsByPlayStyle = xmlValueToArray(combinedXml.Stats.GeneralData.NumSongsPlayedByStyle.Style)
  combinedSongsByPlayStyle.forEach((s) => {
    try {
      const ecfaNumSongsPlayedByStyle =
        xmlValueToArray(ecfa.Stats.GeneralData.NumSongsPlayedByStyle.Style).find(
          (s2) => s2["@_Game"] === s["@_Game"] && s2["@_Style"] === s["@_Style"]
        );
      if (!ecfaNumSongsPlayedByStyle) {
        return;
      }
      s["#text"] += ecfaNumSongsPlayedByStyle["#text"];
    } catch (e) {
      return;
    }
  });
  combinedXml.Stats.GeneralData.NumSongsPlayedByStyle.Style = combinedSongsByPlayStyle

  // these object.keys assume both xml files have all keys, because i'm lazy
  Object.keys(combinedXml.Stats.GeneralData.NumSongsPlayedByDifficulty).forEach(
    (k) =>
    (combinedXml.Stats.GeneralData.NumSongsPlayedByDifficulty[k as keyof NumSongsPlayedByDifficulty] +=
      ecfa.Stats.GeneralData.NumSongsPlayedByDifficulty[k as keyof NumSongsPlayedByDifficulty])
  );

  Object.keys(combinedXml.Stats.GeneralData.NumSongsPlayedByMeter).forEach(
    (k) =>
    (combinedXml.Stats.GeneralData.NumSongsPlayedByMeter[k as keyof NumSongsPlayedByDifficulty] +=
      ecfa.Stats.GeneralData.NumSongsPlayedByMeter[k as keyof NumSongsPlayedByDifficulty])
  );

  combinedXml.Stats.GeneralData.NumTotalSongsPlayed +=
    ecfa.Stats.GeneralData.NumTotalSongsPlayed;

  Object.keys(combinedXml.Stats.GeneralData.NumStagesPassedByGrade).forEach(
    (k) =>
    (combinedXml.Stats.GeneralData.NumStagesPassedByGrade[k] +=
      ecfa.Stats.GeneralData.NumStagesPassedByGrade[k])
  );

  // build a new array consisting of all our song scores we want to add back into `itg`
  let mergedSongs: Array<SongScoresSong> = new Array();
  for (let i = ecfa.Stats.SongScores.Song.length - 1; i >= 0; i--) {
    const ecfaSong = ecfa.Stats.SongScores.Song[i];
    if (!ecfaSong) throw new Error("ECFASong is null")
    const ecfaSongSteps = xmlValueToArray(ecfaSong.Steps);

    ecfaSongSteps.forEach((stp: Step) => {
      xmlValueToArray(stp.HighScoreList.HighScore).forEach(demoteScore);
    });

    const matchingItg = combinedXml.Stats.SongScores.Song.find(
      (s) => s && s["@_Dir"] === ecfaSong["@_Dir"]
    );
    const mergedEcfaToItg = mergeSongs(ecfaSong, matchingItg);
    mergedSongs.push(mergedEcfaToItg);

    if (matchingItg) {
      // remove the matching itg song from the original array, we'll re-add after we're done with the newly-merged stats
      combinedXml.Stats.SongScores.Song =
        combinedXml.Stats.SongScores.Song.filter(
          (s) => s && s["@_Dir"] !== matchingItg["@_Dir"]
        );
    }
  }
  combinedXml.Stats.SongScores.Song.push(...mergedSongs);

  // Convert the object back to xml and return it
  const builder = new XMLBuilder({ ...PARSER_OPTIONS, format: true });
  const combinedXmlContent = builder.build(combinedXml);
  return combinedXmlContent;
}

export function readStatsXml(path: string) {
  try {
    const fileContents = fs.readFileSync(path, "utf8");
    return parseStatsXml(fileContents)
  } catch {
    console.log(`Error: Failed to parse ${path}`);
    return null;
  }
}

export function parseStatsXml(fileContents: string): SaveXML | null {
  const parser = new XMLParser(PARSER_OPTIONS);
  return parser.parse(fileContents);
}