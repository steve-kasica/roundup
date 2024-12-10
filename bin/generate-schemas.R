

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

process_files <- function(files, workflow) {
  id <- 0
  sapply(files, function(path) {
    id <<- id + 1
    df <- read_csv(path)
    fn <- basename(path)
    table_name <- gsub(".csv", "", fn)
    table_data <- list(
      endpoint=paste0(workflow, "/", fn),
      name=fn,
      id=id,
      row_count=nrow(df),
      columns=summarize(df)
    ) %>%
      rjson::toJSON() %>%
      prettify()
    out_dir <- paste0("public/workflows/", workflow, "/", table_name)
    dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)
    out_path <- paste0(out_dir, "/schema.json")

    write(table_data, out_path)
  })

  workflow_data <- list(
    tables = lapply(files, function(path) {
      gsub(".csv", "", basename(path))
    })
  ) %>%
    rjson::toJSON() %>%
    prettify()
  write(workflow_data, paste0("public/workflows/", workflow, "/index.json"))
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

### Generate workflows index ####
write(list(
  workflows=list(
    list(
      value = "2018-05-31-crime-and-heat-analysis",
      label = "Crime & Heat"),
    list(
      value = "2019-04-democratic-candidate-codonors",
      label = "Democratic Candidate Codonors"
    )
  )) %>%
  rjson::toJSON() %>%
  prettify(),
  "public/workflows/index.json"
)