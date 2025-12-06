# CardSnap AI - Business Card Scanner

A React Native mobile application for scanning business cards using AI, built with Expo and powered by OpenAI GPT-4o.

## Features

- 📸 **Camera-based business card scanning** - Capture front and back of business cards
- 🤖 **AI-powered OCR** - Extract contact information using Gemini 2.0 Flash via FastRouter
- ☁️ **Cloud Storage** - Firebase Firestore for contact data (no images stored)
- 🔐 **Multi-method Authentication**
  - ✉️ Email/Password authentication
  - 🔵 Google Sign-In (requires native build)
  - 📱 Phone/SMS authentication (requires Firebase Blaze Plan)
- 💬 **AI Assistant** - Intelligent chatbot with knowledge of your contacts and web search capabilities
- 🔍 **Advanced Search** - Multi-field search (name, company, email, phone, job title)
- 🔀 **Smart Sorting** - Sort by name, company, or date (6 options)
- 🏢 **Company Filtering** - Filter contacts by company with multi-select
- 📤 **Export Contacts** - Export to CSV, Excel, or VCard formats
- 📞 **Quick Actions** - Call, email, or add contacts to phone directly
- ⚠️ **Duplicate Detection** - Prevents saving duplicate contacts
- 📱 **Cross-Platform** - Works on both iOS and Android

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Firebase account (for cloud storage and authentication)
- OpenAI API key (for AI features) OR FastRouter API key (alternative)
- For iOS: macOS with Xcode
- For Android: Android Studio

## Installation

1. Navigate to the mobile-app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your credentials

4. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable authentication methods in Firebase Console:
     - Email/Password (required)
     - Google Sign-In (optional, for native builds)
     - Phone authentication (optional, requires Blaze Plan)
   - Create a Firestore database
   - Copy your Firebase config values to `.env` file
   - For Google Sign-In: Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

5. Configure AI API Key:
   - **Option A (Recommended)**: Use OpenAI API
     - Get your API key from https://platform.openai.com/api-keys
     - Add it to `.env` as `EXPO_PUBLIC_OPENAI_API_KEY`
     - Uses models: `gpt-4o-mini`, `gpt-4o`
   - **Option B**: Use FastRouter API (multi-model router)
     - Get your API key from https://fastrouter.ai/
     - Add it to `.env` as `EXPO_PUBLIC_FASTROUTER_API_KEY`
     - Access to multiple AI providers

## Environment Configuration

Create a `.env` file in the root directory (copy from `.env.example`):

```env
# AI API Keys (choose one)
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
# OR
EXPO_PUBLIC_FASTROUTER_API_KEY=your-fastrouter-api-key-here

# Firebase Configuration (required)
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Google Sign-In (optional, for native builds only)
EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

**Important:** 
- Never commit your `.env` file to version control (it's already in `.gitignore`)
- All variables must start with `EXPO_PUBLIC_` to be accessible in the app
- Restart Expo server after changing `.env` file

## Running the App

### Development (Expo Go)

Start the Expo development server:
```bash
npm start
```

Then scan the QR code with:
- **iOS**: Expo Go app from the App Store
- **Android**: Expo Go app from Google Play Store

**Available in Expo Go:**
- ✅ Email/Password authentication
- ✅ All scanning and AI features
- ✅ Contact management and export
- ❌ Google Sign-In (requires native build)
- ❌ Phone authentication (requires native build)

### Native Build (For Google Sign-In)

**Step 1: Generate native code**
```bash
npx expo prebuild
```

**Step 2: Run on iOS Simulator**
```bash
npx expo run:ios
```

**Step 3: Run on Android Emulator**
```bash
npx expo run:android
```

**Now Available:**
- ✅ Email/Password authentication
- ✅ Google Sign-In
- ✅ Phone authentication (with Blaze Plan)
- ✅ All features

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/              # Screen components
│   │   ├── AuthScreen.tsx         # Login/Register (Email, Google, Phone)
│   │   ├── PhoneAuthScreen.tsx    # Phone authentication flow
│   │   ├── HomeScreen.tsx         # Welcome screen
│   │   ├── DashboardScreen.tsx    # Contact list & management
│   │   ├── ScannerScreen.tsx      # Camera scanning
│   │   └── AssistantScreen.tsx    # AI chatbot
│   ├── services/             # Business logic & APIs
│   │   ├── firebaseConfig.ts      # Firebase configuration
│   │   ├── firebaseAuthService.ts # Multi-method authentication
│   │   ├── firebaseStorageService.ts # Contact data storage
│   │   ├── geminiService.ts       # AI OCR & Assistant
│   │   └── exportService.ts       # CSV/Excel/VCard export
│   └── types/               # TypeScript interfaces
│       └── index.ts
├── assets/                  # Images and logos
├── App.tsx                  # Main app component
├── app.json                 # Expo configuration
├── eas.json                 # EAS Build configuration
├── package.json             # Dependencies
└── .env.example             # Environment variables template
```

## Key Features Explained

### 1. Authentication Methods

**Email/Password** (Works in Expo Go)
- Traditional email and password sign up/login
- No additional configuration needed
- Works immediately after Firebase setup

**Google Sign-In** (Requires native build)
- One-tap Google authentication
- Requires `npx expo prebuild` and native build
- Download Firebase config files (`google-services.json`, `GoogleService-Info.plist`)
- Enable Google provider in Firebase Console

**Phone/SMS Authentication** (Requires native build + Blaze Plan)
- Phone number with SMS verification code
- Requires Firebase Blaze Plan (paid, but includes 10K free verifications/month)
- reCAPTCHA verification for security

### 2. Business Card Scanning
- Capture front and optional back of business card
- AI extracts: name, job title, company, email, phone, website, address
- Manual review before saving
- Duplicate detection alerts

### 3. AI Assistant
- Access via floating chatbot button
- Has complete knowledge of all scanned contacts
- Can answer questions about your network
- Web search capabilities for general queries
- Example queries:
  - "Who works at Google?"
  - "Show all contacts from tech companies"
  - "What's the latest news about AI?"
  - "Find contacts in San Francisco"

### 4. Export & Integration
- **CSV Export**: Universal format for spreadsheets
- **Excel Export**: With UTF-8 BOM for Excel compatibility
- **VCard Export**: Add individual contacts to phone
- **Quick Actions**: Tap phone to call, tap email to compose

### 5. Cloud Sync
- Contact data stored in Firebase Firestore (names, emails, phones, etc.)
- Images NOT stored in cloud (used only for OCR, then discarded)
- Secure user authentication with multiple methods
- Data isolated per user
- Real-time sync across devices

### 6. Search, Sort & Filter
- **Search**: Multi-field instant search (name, company, email, phone, job title)
- **Sort**: 6 sorting options (Name A-Z/Z-A, Company A-Z/Z-A, Date Newest/Oldest)
- **Filter**: Filter by company with checkbox selection
- **Clear All**: Quick reset of all filters and search

## Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

4. Build for iOS:
```bash
eas build --platform ios
```

5. Build for Android:
```bash
eas build --platform android
```

## Configuration

### Camera Permissions

The app requires camera permissions configured in `app.json`:

**iOS:**
- `NSCameraUsageDescription`: "CardSnap AI needs access to your camera to scan business cards."

**Android:**
- `CAMERA` permission
- `READ_EXTERNAL_STORAGE` permission
- `WRITE_EXTERNAL_STORAGE` permission

### API Configuration

1. **AI API** (for OCR and Assistant features):
   - **OpenAI** (recommended): Add `EXPO_PUBLIC_OPENAI_API_KEY` to `.env`
     - Get from: https://platform.openai.com/api-keys
     - Models: `gpt-4o-mini`, `gpt-4o`
   - **FastRouter** (alternative): Add `EXPO_PUBLIC_FASTROUTER_API_KEY` to `.env`
     - Get from: https://fastrouter.ai/
     - Access to multiple AI providers

2. **Firebase** (for cloud storage):
   - Get credentials from Firebase Console
   - Add all Firebase config values to `.env` with `EXPO_PUBLIC_` prefix
   - Enable Email/Password auth in Firebase Console
   - Create Firestore database with security rules

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack)
- **Camera**: Expo Camera (CameraView)
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **AI/OCR**: OpenAI GPT-4o (or FastRouter for multi-model access)
- **File System**: expo-file-system (legacy API)
- **Sharing**: expo-sharing
- **Icons**: lucide-react-native

## Troubleshooting

### AI Model Errors
**Error:** "No available model provider" or "400 Bad Request"
- Check your API key is correct in `.env`
- Restart Expo server: `expo start -c`
- Verify API key has credits/access
- Check console for: `✅ Using OpenAI API key` or `✅ Using FastRouter API key`

### Camera not working
- Ensure permissions are granted in device settings
- Check that camera permissions are configured in app.json
- Try rebuilding the app: `expo start -c`

### Firebase errors
- Verify Firebase config is correct in `.env`
- Ensure Email/Password auth is enabled in Firebase Console
- Check Firestore database is created
- **Important**: Update Firestore Database rules:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```
- Firebase Storage NOT needed (images not stored)
- Restart Expo server after updating `.env`

### Google Sign-In errors
**Error: "RNGoogleSignin could not be found"**
- This is normal in Expo Go - Google Sign-In requires native build
- Run `npx expo prebuild` to generate native code
- Then run `npx expo run:ios` or `npx expo run:android`

**Error: "Google Sign-In is not available"**
- Ensure you've run `npx expo prebuild`
- Download `google-services.json` and `GoogleService-Info.plist` from Firebase
- Place files in project root
- Add `EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID` to `.env`
- Enable Google provider in Firebase Console

### Phone authentication errors
**Error: "auth/billing-not-enabled"**
- Phone auth requires Firebase Blaze Plan (paid tier)
- Upgrade at Firebase Console → Upgrade
- Free tier includes 10K SMS verifications/month
- Alternative: Use Email/Password or Google Sign-In

### Environment variables not loading
- Ensure file is named exactly `.env` (not `.env.txt`)
- All variables must start with `EXPO_PUBLIC_` prefix
- Restart Expo server: Stop (Ctrl+C) and run `npm start` again
- Check console logs for API key confirmation

### Export not working
- Ensure expo-file-system is installed: `npx expo install expo-file-system`
- Check that sharing is available on the device
- VCard files should open in native contacts app

### Build errors
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Ensure all Expo packages are compatible: `npx expo install --fix`

## Switching to Local Storage

To use local storage instead of Firebase:

1. In `App.tsx`, comment out Firebase imports:
```typescript
// Comment these:
// import { getContacts, saveContact, deleteContact } from './src/services/firebaseStorageService';
// import { tryAutoLogin, logout } from './src/services/firebaseAuthService';

// Uncomment these:
import { getContacts, saveContact, deleteContact } from './src/services/storageService';
import { tryAutoLogin, logout } from './src/services/authService';
```

2. Local storage uses AsyncStorage (no internet required)

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [FastRouter Documentation](https://fastrouter.ai/)

## License

MIT

## Support

For issues or questions, please open an issue on the GitHub repository.
