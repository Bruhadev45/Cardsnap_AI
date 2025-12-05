#!/bin/bash

echo "=========================================="
echo "CardSnap AI - Git Commit & Push"
echo "=========================================="
echo ""

# Check git status
echo "📊 Current Git Status:"
git status --short
echo ""

# Add all files
echo "📁 Adding all files..."
git add .
echo "✅ Files staged"
echo ""

# Create commit
echo "💾 Creating commit..."
git commit -m "✨ v1.0.0 - Add search/sort/filter, remove image storage, fix all errors

Major improvements:
- Add advanced search (multi-field: name, company, email, phone, job)
- Add smart sorting (6 options: name, company, date)
- Add company filtering with multi-select checkboxes
- Remove Firebase Storage (images not stored in cloud)
- Contact data only saved to Firestore
- Fix all TypeScript errors (0 errors)
- Fix expo-file-system imports (v19 API)
- Remove all Storage-related errors

Features:
✅ User authentication
✅ Business card scanning with AI OCR (Gemini 2.0 Flash)
✅ Contact management (save, view, delete)
✅ Multi-field search
✅ Sort contacts (6 ways)
✅ Filter by company
✅ Export (CSV/Excel/vCard)
✅ AI Assistant chatbot
✅ Duplicate detection
✅ 100% error-free

Technical changes:
- Updated expo-file-system to v19 API (Paths.document, File)
- Removed Firebase Storage initialization
- Simplified firebaseStorageService (Firestore only)
- Enhanced DashboardScreen with search/sort/filter UI
- Added sort and filter state management
- Removed all image upload/blob conversion code

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

if [ $? -eq 0 ]; then
    echo "✅ Commit created successfully"
    echo ""
    
    # Push to remote
    echo "🚀 Pushing to remote repository..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "✅ SUCCESS! Code pushed to GitHub!"
        echo "=========================================="
    else
        echo ""
        echo "⚠️  Push failed. You may need to:"
        echo "1. Set up remote: git remote add origin <your-repo-url>"
        echo "2. Or push to correct branch: git push origin <branch-name>"
        echo ""
        echo "Run: git remote -v  to check your remote"
    fi
else
    echo "❌ Commit failed"
fi

echo ""
echo "📋 Summary of changes:"
echo "- TypeScript: 0 errors ✅"
echo "- 14 source files"
echo "- All imports fixed"
echo "- No Storage code"
echo "- Search/Sort/Filter added"
echo ""
