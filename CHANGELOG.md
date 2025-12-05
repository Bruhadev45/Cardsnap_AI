# Changelog

All notable changes to CardSnap AI will be documented in this file.

## [1.0.0] - 2025-12-06

### Added
- 🔍 **Advanced Search**: Multi-field search across name, company, email, phone, and job title
- 🔀 **Smart Sorting**: 6 sorting options (Name A-Z/Z-A, Company A-Z/Z-A, Date Newest/Oldest)
- 🏢 **Company Filtering**: Multi-select checkbox filtering by company
- ✨ Clear All button to reset search and filters
- 📊 Active filter indicators showing filter count
- 🎨 Enhanced UI with dropdown menus for sort and filter

### Changed
- ☁️ **Removed Firebase Storage**: Images no longer stored in cloud
- 📝 Contact data only stored in Firestore (names, emails, phones, etc.)
- 🖼️ Images used only for OCR extraction, then discarded
- ⚡ Faster save operations (no image uploads)
- 💰 Lower Firebase costs (no Storage bandwidth/space usage)

### Fixed
- ✅ Fixed all TypeScript compilation errors (0 errors)
- ✅ Fixed expo-file-system imports (updated to v19 API)
- ✅ Removed Firebase Storage permission errors
- ✅ Removed ArrayBuffer/Blob conversion errors
- ✅ Removed image size limit errors (no images stored)

### Technical
- Updated `expo-file-system` to use new v19 API (`Paths.document`, `File` class)
- Removed all Firebase Storage initialization and upload code
- Simplified `firebaseStorageService.ts` to only handle Firestore data
- Added search state management to DashboardScreen
- Implemented sort and filter logic with UI components

## [0.1.0] - Initial Release

### Features
- Business card scanning with camera
- AI-powered OCR using Gemini 2.0 Flash
- Firebase Authentication (email/password)
- Firebase Firestore for contact storage
- Export to CSV, Excel, VCard
- AI Assistant chatbot
- Duplicate detection
- Quick actions (call, email, add to phone)
