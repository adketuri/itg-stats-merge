# itg-stats-merge

A quick CLI tool to merge Stepmania ECFA scores into ITG scores.

## why

ECFA mode is being phased out in ITGMania. This script allows merging of scores before it's "officially" added to ITGMania.

## usage

### cli

1. Install with your package manager
   `yarn`
2. Run the `convert` script with a path to your Stats.xml file and ECFA-Stats.xml file. (Order here matters)
   `yarn convert input/Stats.xml input/ECFA-Stats.xml`
3. It should give you a `Stats-Merged.xml`

### library/package dependency

1. Add it as a dependency
   `yarn add itg-stats-merge`
2. Import and use

   ```
   import { SaveXML } from 'itg-stats-merge/types'
   import { combine, parseStatsXml } from 'itg-stats-merge'

   const itg = parseStatsXml(someData)
   const ecfa = parseStatsXml(someOtherData)
   const combinedXml: SaveXML = combine(itg, ecfa)
   ```

## disclaimer

Though this has been tested on a few inputs, it's always a good idea to back up your `Stats.xml` file and confirm you're happy with the results before committing to the results.
