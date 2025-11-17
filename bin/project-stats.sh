#!/bin/bash

# Project Statistics Script
# Counts files and lines of code in the src directory

# Colors for output
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$PROJECT_ROOT/src"

echo -e "${BOLD}📊 Project Statistics${RESET}"
echo -e "${BOLD}===================${RESET}\n"

# Total files and lines
TOTAL_FILES=$(find "$SRC_DIR" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.scss" \) | wc -l | tr -d ' ')
TOTAL_LINES=$(find "$SRC_DIR" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.scss" \) -exec wc -l {} + | tail -1 | awk '{print $1}')

echo -e "${BOLD}${GREEN}Total:${RESET}"
echo -e "  Files: ${CYAN}$TOTAL_FILES${RESET}"
echo -e "  Lines: ${CYAN}$TOTAL_LINES${RESET}\n"

# JavaScript/TypeScript stats
JS_FILES=$(find "$SRC_DIR" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) | wc -l | tr -d ' ')
JS_LINES=$(find "$SRC_DIR" -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + | tail -1 | awk '{print $1}')

echo -e "${BOLD}${BLUE}JavaScript/TypeScript:${RESET}"
echo -e "  Files: ${CYAN}$JS_FILES${RESET}"
echo -e "  Lines: ${CYAN}$JS_LINES${RESET}\n"

# CSS/SCSS stats
CSS_FILES=$(find "$SRC_DIR" -type f \( -name "*.css" -o -name "*.scss" \) | wc -l | tr -d ' ')
CSS_LINES=$(find "$SRC_DIR" -type f \( -name "*.css" -o -name "*.scss" \) -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')

# Handle case where there are no CSS files
if [ -z "$CSS_LINES" ] || [ "$CSS_FILES" -eq 0 ]; then
    CSS_LINES=0
fi

echo -e "${BOLD}${BLUE}CSS/SCSS:${RESET}"
echo -e "  Files: ${CYAN}$CSS_FILES${RESET}"
echo -e "  Lines: ${CYAN}$CSS_LINES${RESET}\n"

echo -e "${BOLD}===================${RESET}"

