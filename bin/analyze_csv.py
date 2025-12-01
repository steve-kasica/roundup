#!/usr/bin/env python3
"""
Analyze CSV files and output column statistics.

For each column in a CSV file, outputs:
- Parent directory name
- File name
- Column name
- Total number of values
- Total number of null values
- Number of unique values
"""

import sys
import csv
import argparse
from pathlib import Path


def analyze_csv(file_path, workflow=None, include_header=True):
    """Analyze a CSV file and print column statistics."""
    path = Path(file_path)
    parent_dir = path.parent.name
    file_name = path.name
    
    # Use workflow override if provided, otherwise use parent directory name
    workflow_name = workflow if workflow else parent_dir
    
    # Read the CSV file
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        headers = next(reader)
        
        # Initialize data structures for each column
        columns_data = {header: [] for header in headers}
        
        # Read all rows
        for row in reader:
            for i, value in enumerate(row):
                if i < len(headers):
                    columns_data[headers[i]].append(value)
    
    # Print header (tab-separated for easy copy/paste into Google Sheets)
    if include_header:
        print("workflow\tfile_name\tcolumn_name\ttotal_values\tnull_values\tunique_values")
    
    # Analyze and print statistics for each column
    for column_name, values in columns_data.items():
        total_values = len(values)
        
        # Count null values (empty strings or whitespace-only strings)
        null_values = sum(1 for v in values if not v or v.isspace())
        
        # Count unique values (including nulls)
        unique_values = len(set(values))
        
        print(f"{workflow_name}\t{file_name}\t{column_name}\t{total_values}\t{null_values}\t{unique_values}")


def main():
    parser = argparse.ArgumentParser(description="Analyze CSV files and output column statistics")
    parser.add_argument("csv_file", help="Path to the CSV file to analyze")
    parser.add_argument("-w", "--workflow", help="Workflow name (defaults to parent directory name)")
    parser.add_argument("--no-header", action="store_true", help="Exclude header row from output")
    
    args = parser.parse_args()
    
    if not Path(args.csv_file).exists():
        print(f"Error: File '{args.csv_file}' not found", file=sys.stderr)
        sys.exit(1)
    
    analyze_csv(args.csv_file, args.workflow, include_header=not args.no_header)


if __name__ == "__main__":
    main()
