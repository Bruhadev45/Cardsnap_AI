#!/bin/bash

echo "=========================================="
echo "Pushing to GitHub: Cardsnap_AI"
echo "=========================================="
echo ""

# Set the GitHub repository URL
REPO_URL="https://github.com/Bruhadev45/Cardsnap_AI.git"

echo "📍 Repository: $REPO_URL"
echo ""

# Check if remote exists, if not add it
echo "🔗 Setting up remote repository..."
git remote remove origin 2>/dev/null
git remote add origin $REPO_URL
echo "✅ Remote configured"
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
echo "📌 Current branch: $CURRENT_BRANCH"
echo ""

# Stage all files
echo "📁 Staging all files..."
git add .
echo "✅ Files staged"
echo ""

# Show what will be committed
echo "📊 Files to be committed:"
git status --short
echo ""

# Create commit
echo "💾 Creating commit..."
git commit -m "✨ v1.0.0 - CardSnap AI with search/sort/filter

Major Features:
- 📸 Business card scanning with AI OCR (Gemini 2.0 Flash)
- 🔍 Advanced multi-field search (name, company, email, phone, job)
- 🔀 Smart sorting (6 options: name, company, date)
- 🏢 Company filtering with multi-select
- 📤 Export to CSV/Excel/vCard
- 💬 AI Assistant chatbot
- 🔐 Firebase Authentication
- ☁️ Firestore cloud storage (contact data only)

Technical Improvements:
- ✅ Removed Firebase Storage (images not stored)
- ✅ Fixed all TypeScript errors (0 errors)
- ✅ Fixed expo-file-system imports (v19 API)
- ✅ Enhanced UI with dropdown menus
- ✅ Proper error handling
- ✅ Clean, organized codebase

Features:
✅ User authentication (register/login/logout)
✅ Business card OCR extraction
✅ Contact management (save/view/delete)
✅ Multi-field search
✅ Sort contacts (6 ways)
✅ Filter by company
✅ Export contacts
✅ AI Assistant
✅ Duplicate detection
✅ Quick actions (call/email)

Stack:
- React Native + Expo 54
- TypeScript
- Firebase (Auth + Firestore)
- Gemini 2.0 Flash AI
- React Navigation

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

if [ $? -eq 0 ]; then
    echo "✅ Commit created successfully"
    echo ""
    
    # Push to GitHub
    echo "🚀 Pushing to GitHub..."
    git push -u origin main --force
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "✅ SUCCESS! Code pushed to GitHub!"
        echo "=========================================="
        echo ""
        echo "🔗 Your repository: https://github.com/Bruhadev45/Cardsnap_AI"
        echo ""
        echo "Next steps:"
        echo "1. Visit your repo: https://github.com/Bruhadev45/Cardsnap_AI"
        echo "2. Check README.md displays correctly"
        echo "3. Add repository description on GitHub"
        echo "4. Add topics/tags (react-native, expo, ai, ocr, etc.)"
        echo "5. Share with your team!"
        echo ""
    else
        echo ""
        echo "⚠️  Push failed. You may need to:"
        echo "1. Check your GitHub authentication"
        echo "2. Create the repository on GitHub first"
        echo "3. Use personal access token if password auth is disabled"
        echo ""
        echo "To create repo:"
        echo "1. Go to https://github.com/new"
        echo "2. Repository name: Cardsnap_AI"
        echo "3. Make it public or private"
        echo "4. DON'T initialize with README (we have one)"
        echo "5. Click 'Create repository'"
        echo "6. Run this script again"
    fi
else
    echo "❌ Commit failed. Check git status."
fi

echo ""
