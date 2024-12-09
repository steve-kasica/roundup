

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

process_files <- function(files, directory) {
  id <- 0;
  out_dir <- paste0("src/data/", directory)
  sapply(files, function(path) {
    id <<- id + 1
    df <- read_csv(path)
    fn <- basename(path)
    data <- list(
      endpoint=paste0(directory, "/", fn),
      name=fn,
      id=id,
      row_count=nrow(df),
      columns=summarize(df)
    ) %>%
      rjson::toJSON() %>%
      prettify()
      
    dir.create(out_dir, showWarnings = FALSE)
    outPath <- paste0(out_dir, "/", gsub(".csv", ".json", fn))
    write(data, outPath)
  })
}

#### Process data from 2018-05-31-crime-and-heat-analysis #####
crime_and_heat <- c(
  "example-workflows/2018-05-31-crime-and-heat-analysis/lambert_1.csv",
  "example-workflows/2018-05-31-crime-and-heat-analysis/lambert_2.csv",
  "example-workflows/2018-05-31-crime-and-heat-analysis/violent_crimes.csv"
)
process_files(crime_and_heat, "2018-05-31-crime-and-heat-analysis")

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
  "2019-04-democratic-candidate-codonors"
)