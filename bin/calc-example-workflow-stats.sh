#!/bin/bash

# This script calculates example workflow statistics by analyzing CSV files
# in the example-workflows directory and outputs the results to a TSV file.

OUTPUT_FILE="example-workflows/column-stats.tsv"
WORKFLOW_DIR="example-workflows"

# Crime and Heat Analysis Workflow
CRIME_AND_HEAT_DIR=2018-05-31-crime-and-heat-analysis;
echo "Processing ${CRIME_AND_HEAT_DIR}"
python bin/analyze_csv.py $WORKFLOW_DIR/$CRIME_AND_HEAT_DIR/lambert_1.csv \
    --workflow $CRIME_AND_HEAT_DIR \
    > $OUTPUT_FILE
python bin/analyze_csv.py $WORKFLOW_DIR/$CRIME_AND_HEAT_DIR/lambert_2.csv \
    --no-header \
    --workflow $CRIME_AND_HEAT_DIR \
    >> $OUTPUT_FILE
python bin/analyze_csv.py $WORKFLOW_DIR/$CRIME_AND_HEAT_DIR/violent_crimes.csv \
    --no-header \
    --workflow $CRIME_AND_HEAT_DIR \
    >> $OUTPUT_FILE

# 2019-04-democratic-candidates-codonors
DEMOCRATIC_CODONORS_DIR=2019-04-democratic-candidate-codonors;
echo "Processing ${DEMOCRATIC_CODONORS_DIR}"
python bin/analyze_csv.py $WORKFLOW_DIR/$DEMOCRATIC_CODONORS_DIR/inputs/candidates.csv \
    --no-header \
    --workflow $DEMOCRATIC_CODONORS_DIR \
    >> $OUTPUT_FILE
python bin/analyze_csv.py $WORKFLOW_DIR/$DEMOCRATIC_CODONORS_DIR/inputs/filings.csv \
    --no-header \
    --workflow $DEMOCRATIC_CODONORS_DIR \
    >> $OUTPUT_FILE
for filings_file in $WORKFLOW_DIR/$DEMOCRATIC_CODONORS_DIR/inputs/filings/*.csv; do
    python bin/analyze_csv.py "$filings_file" \
        --no-header \
        --workflow $DEMOCRATIC_CODONORS_DIR \
        >> $OUTPUT_FILE
done

# Baby Name Politics Workflow
BABYNAME_POLITICS_DIR=babyname_politics;
echo "Processing ${BABYNAME_POLITICS_DIR}"
for state_file in $WORKFLOW_DIR/$BABYNAME_POLITICS_DIR/data/states/*.csv; do
    python bin/analyze_csv.py "$state_file" \
        --no-header \
        --workflow $BABYNAME_POLITICS_DIR \
        >> $OUTPUT_FILE
done

# nyc-trips
NYC_TRIPS_DIR=nyc-trips;
echo "Processing ${NYC_TRIPS_DIR}"
for trips_file in $WORKFLOW_DIR/$NYC_TRIPS_DIR/*.csv; do
    python bin/analyze_csv.py "$trips_file" \
        --no-header \
        --workflow $NYC_TRIPS_DIR \
        >> $OUTPUT_FILE
done

# school-star-ratings-2018
SCHOOL_STAR_RATINGS_DIR=school-star-ratings-2018;
echo "Processing ${SCHOOL_STAR_RATINGS_DIR}"
for input_file in $WORKFLOW_DIR/$SCHOOL_STAR_RATINGS_DIR/input/*.csv; do
    python bin/analyze_csv.py "$input_file" \
        --no-header \
        --workflow $SCHOOL_STAR_RATINGS_DIR \
        >> $OUTPUT_FILE
done