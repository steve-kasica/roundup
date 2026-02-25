## Excluded workflows

I've had to exclude some Table Scraps workflows from this reproduction evaluation.

## Workflows that did not include merging tables

- @datadesk/swana-population-map
- @palewire/california-buildings-in-severe-fire-hazard-zones
- @sahilchinoy/the-cube-root-law
- @sahilchinoy/heat-index
- fivethirtyeight/data/tree/master/us-weather-history
- BBC-Data-Unit/electric-car-charging-points
- BBC-Data-Unit/internal-migration-london
- BBC-Data-Unit/midwife-led-units
- BuzzFeedNews/2016-09-shy-trumpers
- beecycles/Endangered-Species-Act-Louisiana
- datadesk/california-ccscore-analysis
- fivethirtyeight/data/tree/master/bob-ross
- fivethirtyeight/data/tree/master/bechdel
- fivethirtyeight/data/tree/master/librarians
- polygraph-cool/skatemusic
- voxmedia/data-projects/…/vox-central-line-infections
- voxmedia/data-projects/…/verge-uber-launch-dates
- BuzzFeedNews/2016-04-republican-donor-movements

### Workflow that did not work with tabluar data

- nzzdev/st-methods/tree/master/1805-regionen: text data
- statesman/2019-ems-analysis: geospatial
- datadesk/census-hard-to-map-analysis: geospatial
- fivethirtyeight/data/tree/master/buster-posey-mvp: image
- thebuffalonews/new-york-schools-assessment: JSON

### Workflows where raw data was not attainable

- TheUpshot/prison-admissions
- BuzzFeedNews/2016-11-bellwether-counties
- striblab/201901-achievementgap
- striblab/201901-hospitalquality
- TimeMagazine/wikipedia-rankings
- nytimes/gunsales
- Quartz/work-from-home
- trendct/data/2016/05/lending-club (just a left join anyway)

### Workflows with raw data that is too big

- [California Crop Production Wages Analysis](https://github.com/datadesk/california-crop-production-wages-analysis): The 26 files downloaded from BLS when uncompressed are between 127MB and 486MB large, which is even too large to trim this data in Excel. So this workflow is an example of when the raw data is just too large, which is a same because that keeps lots of journalists without access to a developer from being able to use this data.
