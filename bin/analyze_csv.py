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
from pathlib import Path


def analyze_csv(file_path):
    """Analyze a CSV file and print column statistics."""
    path = Path(file_path)
    parent_dir = path.parent.name
    file_name = path.name
    
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
    print("workflow\tfile_name\tcolumn_name\ttotal_values\tnull_values\tunique_values")
    
    # Analyze and print statistics for each column
    for column_name, values in columns_data.items():
        total_values = len(values)
        
        # Count null values (empty strings or whitespace-only strings)
        null_values = sum(1 for v in values if not v or v.isspace())
        
        # Count unique values (including nulls)
        unique_values = len(set(values))
        
        print(f"{parent_dir}\t{file_name}\t{column_name}\t{total_values}\t{null_values}\t{unique_values}")


def main():
    if len(sys.argv) != 2:
        print("Usage: python analyze_csv.py <csv_file>", file=sys.stderr)
        sys.exit(1)
    
    csv_file = sys.argv[1]
    
    if not Path(csv_file).exists():
        print(f"Error: File '{csv_file}' not found", file=sys.stderr)
        sys.exit(1)
    
    analyze_csv(csv_file)


if __name__ == "__main__":
    main()
