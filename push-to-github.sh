#!/bin/bash

# Script to push to GitHub with credentials
# IMPORTANT: Revoke the exposed token and generate a new one!

echo "======================================"
echo "Pushing to GitHub"
echo "======================================"
echo ""

# Configure git to cache credentials
git config --global credential.helper store

echo "Pushing to origin main..."
git push -u origin main

echo ""
echo "✅ Push complete!"
echo ""
echo "⚠️  SECURITY REMINDER:"
echo "Please revoke the exposed token at:"
echo "https://github.com/settings/tokens"
echo ""
echo "And generate a new one for future use."
echo ""

