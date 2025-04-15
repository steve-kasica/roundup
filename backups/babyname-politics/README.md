# Babyname Politics

This workflow replicates the data work supporting "[Is Your Name Democratic or Republican?](https://time.com/4606813/democrat-republican-name/)" by  *Time* magazine, published on Dec. 21, 2016. To support analysis examining regional correlations between popular baby names and election results, journalist Chris Wilson combines 52 tables, 51 tables of baby name frequency (all 50 US states plus the District of Columbia) from the Social Security Administration and one table of 2016 presidential election results obtained from an unspecified source.

While *Time* has since deleted the code and data repository that details the methodology, it's still available via [Internet Archive](https://web.archive.org/web/20180613010437/https://github.com/TimeMagazine/babyname_politics), and a [fork still exists on GitHub](https://github.com/steve-kasica/babyname_politics).

## Replicating the worklfow

### Step 1: Combining popular baby name data by state
While OpenRefine's importer can import multiple files that have the same schema as one file, concatenating rows together. Importing all 51 files that represent data from all 50 states and the District of Columbia exceeds the memory limits, so I've broken the importing job up. With each of these six import jobs, I apply the same consistent set of column names: `ABBR`, `GENDER`, `Year`, `NAME`, `VALUE`.

1. AK-GA: AK, AL, AR, AZ, CA, CO, CT, DC, DE, FL, GA
2. HI-LA: HI, IA, ID, IL, IN, KS, KY, LA
3. MA-MT: MA, MD, ME, MI, MN, MO, MS, MT
4. NC-NY: NC, ND, NE, NH, NJ, NM, NV, NY
5. OH-TX: OH, Ok, OR, PA, RI, SC, SD, TN, TX
6. UT-WY: UT, VA, VT, WA, WI, WV, WY