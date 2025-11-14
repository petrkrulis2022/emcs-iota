@echo off
REM EMCS Backend Integration Tests - Quick Start Script (Windows)

echo 🧪 EMCS Backend Integration Tests
echo ==================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Run tests
echo 🚀 Running integration tests...
echo.
call npm test

echo.
echo ✅ Test execution complete!
echo.
echo 💡 Tips:
echo   - Run 'npm run test:watch' for watch mode
echo   - Run 'npx vitest --ui' for interactive UI
echo   - See TEST_SETUP.md for more details
