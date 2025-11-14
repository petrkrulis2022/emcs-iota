#!/bin/bash

# Frontend Build Test Script
# Tests that the frontend builds successfully for production

set -e

echo "======================================"
echo "Frontend Build Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if in frontend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the frontend directory"
    exit 1
fi

echo "Step 1: Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Dependency installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo "Step 2: Running TypeScript check..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ TypeScript check failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ TypeScript check passed${NC}"
echo ""

echo "Step 3: Running linter..."
npm run lint

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠ Linting warnings found (non-critical)${NC}"
else
    echo -e "${GREEN}✓ Linting passed${NC}"
fi
echo ""

echo "Step 4: Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

echo "Step 5: Checking build output..."
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist directory not found${NC}"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ index.html not found in dist${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build output verified${NC}"
echo ""

echo "Step 6: Analyzing build size..."
du -sh dist
echo ""

echo "======================================"
echo "Build Test Summary"
echo "======================================"
echo ""
echo -e "${GREEN}✓ All checks passed!${NC}"
echo ""
echo "Build output: ./dist"
echo "To preview: npm run preview"
echo ""
echo "Ready for deployment!"
