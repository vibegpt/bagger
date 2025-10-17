#!/bin/bash

# Weekly Automation Script for Bagger.tools
# Run every Monday at 8:00 AM EST
# This script fetches data, generates thread, and creates visualizations

set -e  # Exit on error

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3001}"
OUTPUT_DIR="./automation-output"
DATE=$(date +%Y-%m-%d)
WEEK_DIR="$OUTPUT_DIR/week-$DATE"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Bagger Weekly Automation${NC}"
echo -e "${GREEN}  Date: $DATE${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Create output directory
mkdir -p "$WEEK_DIR"

# Step 1: Fetch Weekly Report Data
echo -e "${YELLOW}Step 1: Fetching weekly report data...${NC}"
curl -s "$API_BASE_URL/api/weekly-report" > "$WEEK_DIR/report.json"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Report data fetched successfully${NC}"
else
  echo -e "${RED}✗ Failed to fetch report data${NC}"
  exit 1
fi

# Step 2: Generate Twitter Thread
echo -e "${YELLOW}Step 2: Generating Twitter thread...${NC}"
curl -s "$API_BASE_URL/api/twitter-thread" > "$WEEK_DIR/thread.json"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Twitter thread generated successfully${NC}"

  # Extract and save thread as plain text for easy copying
  cat "$WEEK_DIR/thread.json" | jq -r '.thread[] | "Tweet \(.number):\n\(.text)\n"' > "$WEEK_DIR/thread.txt"
  echo -e "${GREEN}✓ Thread saved to thread.txt${NC}"
else
  echo -e "${RED}✗ Failed to generate Twitter thread${NC}"
  exit 1
fi

# Step 3: Generate Visualizations
echo -e "${YELLOW}Step 3: Generating visualizations...${NC}"

# Pie chart - Losers
echo "  - Generating pie chart (losers)..."
CHART_URL=$(curl -s "$API_BASE_URL/api/visualizations?type=pie-chart-losers" | jq -r '.chartUrl')
echo "$CHART_URL" > "$WEEK_DIR/chart-pie-losers-url.txt"
curl -s "$CHART_URL" > "$WEEK_DIR/chart-pie-losers.png"
echo -e "${GREEN}  ✓ Pie chart saved${NC}"

# Comparison chart
echo "  - Generating comparison chart..."
CHART_URL=$(curl -s "$API_BASE_URL/api/visualizations?type=comparison-success-rate" | jq -r '.chartUrl')
echo "$CHART_URL" > "$WEEK_DIR/chart-comparison-url.txt"
curl -s "$CHART_URL" > "$WEEK_DIR/chart-comparison.png"
echo -e "${GREEN}  ✓ Comparison chart saved${NC}"

# Bar chart - Scale
echo "  - Generating bar chart (scale)..."
CHART_URL=$(curl -s "$API_BASE_URL/api/visualizations?type=bar-chart-scale" | jq -r '.chartUrl')
echo "$CHART_URL" > "$WEEK_DIR/chart-bar-scale-url.txt"
curl -s "$CHART_URL" > "$WEEK_DIR/chart-bar-scale.png"
echo -e "${GREEN}  ✓ Bar chart saved${NC}"

# Whale trend chart
echo "  - Generating whale trend chart..."
CHART_URL=$(curl -s "$API_BASE_URL/api/visualizations?type=whale-trend" | jq -r '.chartUrl')
echo "$CHART_URL" > "$WEEK_DIR/chart-whale-trend-url.txt"
curl -s "$CHART_URL" > "$WEEK_DIR/chart-whale-trend.png"
echo -e "${GREEN}  ✓ Whale trend chart saved${NC}"

# Step 4: Create Summary Report
echo -e "${YELLOW}Step 4: Creating summary report...${NC}"

cat > "$WEEK_DIR/SUMMARY.md" << EOF
# Weekly Report Summary - $DATE

## Report Data

$(cat "$WEEK_DIR/report.json" | jq '.')

## Twitter Thread

$(cat "$WEEK_DIR/thread.txt")

## Visualizations Generated

1. Pie Chart (Losers): \`chart-pie-losers.png\`
2. Comparison Chart: \`chart-comparison.png\`
3. Bar Chart (Scale): \`chart-bar-scale.png\`
4. Whale Trend: \`chart-whale-trend.png\`

## Next Steps

1. Review the thread in \`thread.txt\`
2. Check visualizations
3. Post to Twitter on Monday morning (9-11 AM EST)
4. Pin thread to profile
5. Monitor engagement

## Files in this directory

\`\`\`
$(ls -1 "$WEEK_DIR")
\`\`\`

---
Generated: $(date)
EOF

echo -e "${GREEN}✓ Summary report created${NC}"

# Step 5: Display Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Automation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📁 Output directory: $WEEK_DIR"
echo ""
echo "📄 Files created:"
echo "  - report.json        (Raw data)"
echo "  - thread.json        (Full thread JSON)"
echo "  - thread.txt         (Ready to copy-paste)"
echo "  - chart-*.png        (4 visualization images)"
echo "  - SUMMARY.md         (Complete summary)"
echo ""
echo -e "${YELLOW}Next: Review files and post thread to Twitter${NC}"
echo ""

# Optional: Open the directory
if command -v open &> /dev/null; then
  open "$WEEK_DIR"
elif command -v xdg-open &> /dev/null; then
  xdg-open "$WEEK_DIR"
fi

exit 0
