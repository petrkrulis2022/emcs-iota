#!/bin/bash

# Push to GitHub using personal access token
# Usage: ./push-with-token.sh YOUR_TOKEN

if [ -z "$1" ]; then
    echo "Usage: ./push-with-token.sh YOUR_GITHUB_TOKEN"
    exit 1
fi

TOKEN=$1

echo "======================================"
echo "Pushing to GitHub"
echo "======================================"
echo ""

# Set remote URL with token
git remote set-url origin https://petrkrulis2022:${TOKEN}@github.com/petrkrulis2022/emcs-iota.git

# Push to main
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
    echo "❌ Push failed. Please check:"
    echo "1. Token has 'repo' permissions"
    echo "2. Repository exists: https://github.com/petrkrulis2022/emcs-iota"
    echo "3. Token is not expired"
    echo ""
fi

# Remove token from remote URL for security
git remote set-url origin https://github.com/petrkrulis2022/emcs-iota.git

echo "⚠️  SECURITY REMINDER:"
echo "Revoke the exposed token and generate a new one at:"
echo "https://github.com/settings/tokens"
echo ""

