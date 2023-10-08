# itg-stats-merge
A quick CLI tool to merge Stepmania ECFA scores into ITG scores.

## why
ECFA mode is being phased out in ITGMania. This script allows merging of scores before it's "officially" added to ITGMania.

## usage
1. Install with your package manager

    `npm install`
2. Run the `convert` script with a path to your Stats.xml file and ECFA-Stats.xml file. (Order here matters)
    
    `npm run convert input/Stats.xml input/ECFA-Stats.xml`

## disclaimer
This is a destructive operation. It's a good idea to back up your `Stats.xml` file before merging.