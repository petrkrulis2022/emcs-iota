#!/bin/bash

# Script to push to GitHub with token authentication
# Run this script and paste your token when prompted

echo "======================================"
echo "GitHub Push Script"
echo "======================================"
echo ""

# Prompt for token
read -sp "Enter your GitHub Personal Access Token: " TOKEN
echo ""
echo ""

if [ -z "$TOKEN" ]; then
    echo "❌ No token provided"
    exit 1
fi

echo "Setting up remote with token..."
git remote set-url origin https://${TOKEN}@github.com/petrkrulis2022/emcs-iota.git

echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "View your repository at:"
    echo "https://github.com/petrkrulis2022/emcs-iota"
    echo ""
else
    echo ""
    echo "❌ Push failed"
    exit 1
fi

# Clean up - remove token from remote URL
echo "Cleaning up remote URL..."
git remote set-url origin https://github.com/petrkrulis2022/emcs-iota.git

echo "✅ Done!"
echo ""

