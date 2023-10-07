// Generated by https://quicktype.io

export interface SaveXML {
    "?xml": XML;
    Stats:  Stats;
}

export interface XML {
    "@_version":  string;
    "@_encoding": string;
}

export interface Stats {
    GeneralData:    GeneralData;
    SongScores:     SongScores;
    CourseScores:   string;
    CategoryScores: string;
    ScreenshotData: string;
    CalorieData:    CalorieData;
}

export interface CalorieData {
    CaloriesBurned: CaloriesBurned;
}

export interface CaloriesBurned {
    "#text":  number;
    "@_Date": string;
}

export interface GeneralData {
    DisplayName:                string;
    CharacterID:                string;
    LastUsedHighScoreName:      string;
    WeightPounds:               number;
    Voomax:                     number;
    BirthYear:                  number;
    IgnoreStepCountCalories:    number;
    IsMale:                     number;
    IsMachine:                  number;
    Guid:                       string;
    SortOrder:                  string;
    LastDifficulty:             string;
    LastCourseDifficulty:       string;
    LastStepsType:              string;
    Song:                       GeneralDataSong;
    Course:                     string;
    CurrentCombo:               number;
    TotalSessions:              number;
    TotalSessionSeconds:        number;
    TotalGameplaySeconds:       number;
    TotalCaloriesBurned:        number;
    GoalType:                   number;
    GoalCalories:               number;
    GoalSeconds:                number;
    LastPlayedMachineGuid:      string;
    LastPlayedDate:             string;
    TotalDancePoints:           number;
    NumExtraStagesPassed:       number;
    NumExtraStagesFailed:       number;
    NumToasties:                number;
    TotalTapsAndHolds:          number;
    TotalJumps:                 number;
    TotalHolds:                 number;
    TotalRolls:                 number;
    TotalMines:                 number;
    TotalHands:                 number;
    TotalLifts:                 number;
    DefaultModifiers:           DefaultModifiers;
    Unlocks:                    string;
    NumSongsPlayedByPlayMode:   NumSedByPlayMode;
    NumSongsPlayedByStyle:      NumSongsPlayedByStyle;
    NumSongsPlayedByDifficulty: NumSongsPlayedByDifficulty;
    NumSongsPlayedByMeter:      NumSongsPlayedByMeter;
    NumTotalSongsPlayed:        number;
    NumStagesPassedByPlayMode:  NumSedByPlayMode;
    NumStagesPassedByGrade:     { [key: string]: number };
}

export interface DefaultModifiers {
    dance: string;
}

export interface NumSongsPlayedByDifficulty {
    Challenge: number;
}

export interface NumSongsPlayedByMeter {
    Meter9:  number;
    Meter11: number;
}

export interface NumSedByPlayMode {
    Regular: number;
}

export interface NumSongsPlayedByStyle {
    Style: Style;
}

export interface Style {
    "#text":   number;
    "@_Game":  string;
    "@_Style": string;
}

export interface GeneralDataSong {
    "@_Dir": string;
}

export interface SongScores {
    Song: SongElement[];
}

export interface SongElement {
    Steps:   Steps;
    "@_Dir": string;
}

export interface Steps {
    HighScoreList:  HighScoreList;
    "@_Difficulty": string;
    "@_StepsType":  string;
}

export interface HighScoreList {
    NumTimesPlayed: number;
    LastPlayed:     string;
    HighGrade:      string;
    HighScore:      HighScore;
}

export interface HighScore {
    Name:                 string;
    Grade:                string;
    Score:                number;
    PercentDP:            number;
    SurviveSeconds:       number;
    MaxCombo:             number;
    StageAward:           string;
    PeakComboAward:       string;
    Modifiers:            string;
    DateTime:             string;
    PlayerGuid:           string;
    MachineGuid:          string;
    ProductID:            number;
    TapNoteScores:        TapNoteScores;
    HoldNoteScores:       HoldNoteScores;
    RadarValues:          { [key: string]: number };
    LifeRemainingSeconds: number;
    Disqualified:         number;
}

export interface HoldNoteScores {
    LetGo:      number;
    Held:       number;
    MissedHold: number;
}

export interface TapNoteScores {
    HitMine:        number;
    AvoidMine:      number;
    CheckpointMiss: number;
    Miss:           number;
    W5:             number;
    W4:             number;
    W3:             number;
    W2:             number;
    W1:             number;
    CheckpointHit:  number;
}
