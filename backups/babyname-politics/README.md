# Babyname Politics

This workflow replicates the data work supporting "[Is Your Name Democratic or Republican?](https://time.com/4606813/democrat-republican-name/)" by  *Time* magazine, published on Dec. 21, 2016. To support analysis examining regional correlations between popular baby names and election results, journalist Chris Wilson combines 52 tables, 51 tables of baby name frequency (all 50 US states plus the District of Columbia) from the Social Security Administration and one table of 2016 presidential election results obtained from an unspecified source.

While *Time* has since deleted the code and data repository that details the methodology, it's still available via [Internet Archive](https://web.archive.org/web/20180613010437/https://github.com/TimeMagazine/babyname_politics), and a [fork still exists on GitHub](https://github.com/steve-kasica/babyname_politics).

## Replicating the workflow

### Step 1: Combining popular baby name data by state
While OpenRefine's importer can import multiple files that have the same schema as one file, concatenating rows together. Importing all 51 files that represent data from all 50 states and the District of Columbia exceeds the memory limits (2048 MB), so I've broken job up into multiple batches. In some cases, even calculating column info for one of these OpenRefine projects exceeds Java's Heap.

With each of these seven import jobs, I apply the same consistent set of column names: `ABBR`, `GENDER`, `YEAR`, `NAME`, `VALUE`.

1. AK-GA (1777071525925): AK, AL, AR, AZ, CA, CO, CT, DC, DE, FL, GA
2. HI-IL (2631168748627): HI, IA, ID, IL
3. IN-LA (2620962230195): IN, KS, KY, LA
4. MA-MT (1954092532131): MA, MD, ME, MI, MN, MO, MS, MT
5. NC-NY (2469210019175): NC, ND, NE, NH, NJ, NM, NV, NY
6. OH-TX (2429986839284): OH, Ok, OR, PA, RI, SC, SD, TN, TX
7. UT-WY (1899665756039): UT, VA, VT, WA, WI, WV, WY