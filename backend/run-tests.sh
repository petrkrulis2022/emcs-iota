#!/bin/bash

# EMCS Backend Integration Tests - Quick Start Script

echo "🧪 EMCS Backend Integration Tests"
echo "=================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Run tests
echo "🚀 Running integration tests..."
echo ""
npm test

echo ""
echo "✅ Test execution complete!"
echo ""
echo "💡 Tips:"
echo "  - Run 'npm run test:watch' for watch mode"
echo "  - Run 'npx vitest --ui' for interactive UI"
echo "  - See TEST_SETUP.md for more details"
