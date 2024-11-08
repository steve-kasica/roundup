

library(tidyverse)
library(rjson)
library(jsonlite)

summarize <- function(df) {
  columns = colnames(df)
  m <- length(columns)
  l <- lapply(1:m, function(i) {
    return(
      list(
        name = columns[i],
        index = i - 1,  # change from 1-index to 0-index
        columnType = "categorical",
        values = table(df[[i]], useNA = "always")
      )
    )
  })
  return(l)
}

process_files <- function(files, out_dir) {
  id <- 0;
  sapply(files, function(path) {
    id <<- id + 1
    df <- read_csv(path)
    fn <- basename(path)
    outPath <- paste0(out_dir, "/", gsub(".csv", ".json", fn))
    data <- list(
      # path=paste0(out_dir, "/", path),
      name=basename(path),
      id=id,
      row_count=nrow(df),
      columns=summarize(df)
    ) %>%
      rjson::toJSON() %>%
      prettify()
    dir.create(out_dir, showWarnings = FALSE)
    write(data, outPath)
  })
}

#### Process data from 2018-05-31-crime-and-heat-analysis #####
crime_and_heat <- c(
  "example-workflows/2018-05-31-crime-and-heat-analysis/lambert_1.csv",
  "example-workflows/2018-05-31-crime-and-heat-analysis/lambert_2.csv",
  "example-workflows/2018-05-31-crime-and-heat-analysis/violent_crimes.csv"
)
process_files(crime_and_heat, "src/data/2018-05-31-crime-and-heat-analysis")

#### Process data from 2019-04-democratic-candidate-codonors #####
process_democratic_codonors <- function(src_dir, out_dir) {
  filings <- read_csv(paste0(src_dir, "/", "filings.csv"))
  files <- c(
    paste0(src_dir, "/candidates.csv"),
    paste0(src_dir, "/filings.csv"),
    sapply(filings$filing_id, function(id) {
      paste0(src_dir, "/filings/", id, ".csv")
    })
  )
  process_files(files, out_dir)
}

process_democratic_codonors(
  "example-workflows/2019-04-democratic-candidate-codonors/inputs",
  "src/data/2019-04-democratic-candidate-codonors"
)