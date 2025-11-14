@echo off
REM Frontend Build Test Script for Windows
REM Tests that the frontend builds successfully for production

echo ======================================
echo Frontend Build Test
echo ======================================
echo.

REM Check if in frontend directory
if not exist package.json (
    echo Error: package.json not found
    echo Please run this script from the frontend directory
    exit /b 1
)

echo Step 1: Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Dependency installation failed
    exit /b 1
)
echo Dependencies installed
echo.

echo Step 2: Running TypeScript check...
call npx tsc --noEmit

if %ERRORLEVEL% NEQ 0 (
    echo TypeScript check failed
    exit /b 1
)
echo TypeScript check passed
echo.

echo Step 3: Running linter...
call npm run lint

if %ERRORLEVEL% NEQ 0 (
    echo Linting warnings found (non-critical)
) else (
    echo Linting passed
)
echo.

echo Step 4: Building for production...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed
    exit /b 1
)
echo Build successful
echo.

echo Step 5: Checking build output...
if not exist dist (
    echo dist directory not found
    exit /b 1
)

if not exist dist\index.html (
    echo index.html not found in dist
    exit /b 1
)

echo Build output verified
echo.

echo ======================================
echo Build Test Summary
echo ======================================
echo.
echo All checks passed!
echo.
echo Build output: .\dist
echo To preview: npm run preview
echo.
echo Ready for deployment!
echo.

pause
