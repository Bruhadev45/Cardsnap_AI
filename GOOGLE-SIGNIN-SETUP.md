# Google Sign-In Setup Guide

## Overview
Your CardSnap AI app now supports multiple authentication methods:
- ✅ Email/Password (existing)
- ✅ Google Sign-In (new)
- ✅ Phone Number (new - requires additional setup)

## Step 1: Enable Google Sign-In in Firebase

1. **Go to Firebase Console**:
   - Visit: https://console.firebase.google.com
   - Select your project: `cardsnap-ai-4d0ce`

2. **Enable Google Sign-In**:
   - Go to **Authentication** → **Sign-in method**
   - Click on **Google**
   - Toggle **Enable** to ON
   - Click **Save**

## Step 2: Get Web Client ID

1. **In Firebase Console**:
   - Still in **Authentication** → **Sign-in method** → **Google**
   - You'll see **Web SDK configuration**
   - Copy the **Web client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)

2. **Add to .env file**:
   ```env
   EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com
   ```

## Step 3: Configure Android (for Google Sign-In)

### Get SHA-1 Certificate Fingerprint

For development:
```bash
# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Windows
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

Copy the **SHA-1** fingerprint (looks like: `A1:B2:C3:...`)

### Add SHA-1 to Firebase

1. **In Firebase Console**:
   - Go to **Project Settings** (gear icon)
   - Scroll to **Your apps** section
   - Click on your Android app
   - Click **Add fingerprint**
   - Paste your SHA-1 fingerprint
   - Click **Save**

2. **Download google-services.json**:
   - Click **Download google-services.json**
   - Place it in your project root (for EAS Build, add to secrets)

## Step 4: Enable Phone Authentication in Firebase

1. **In Firebase Console**:
   - Go to **Authentication** → **Sign-in method**
   - Click on **Phone**
   - Toggle **Enable** to ON
   - Click **Save**

2. **Note**: Phone authentication requires additional setup:
   - reCAPTCHA verification for web
   - APNs configuration for iOS
   - Currently shows "coming soon" message in app

## Step 5: Test the App

1. **Restart Expo server**:
   ```bash
   npm start
   ```

2. **Test Authentication Methods**:
   - ✅ Email/Password - Should work as before
   - ✅ Google Sign-In - Click "Continue with Google"
   - ⚠️ Phone - Shows "coming soon" message

## UI Changes

### New Auth Screen Features:
- **Email/Password** - Original method (top)
- **"OR" Divider** - Separates methods
- **Google Sign-In Button** - With Google icon
- **Phone Sign-In Button** - With phone icon (placeholder)

### Button Styles:
- Primary button (white) - Email sign-in
- Secondary buttons (dark) - Social sign-in methods

## Troubleshooting

### Google Sign-In Not Working

**Error: "DEVELOPER_ERROR"**
- Check SHA-1 fingerprint is added to Firebase
- Verify Web Client ID is correct in `.env`
- Restart Expo server

**Error: "SIGN_IN_CANCELLED"**
- User cancelled the sign-in flow
- This is normal behavior

**Error: "PLAY_SERVICES_NOT_AVAILABLE"**
- Google Play Services not installed (emulator)
- Use a device with Google Play Services

### Phone Authentication

Phone authentication requires:
1. reCAPTCHA setup (web)
2. APNs certificates (iOS)
3. Additional native configuration

For now, it shows a placeholder message. Full implementation can be added later.

## Environment Variables

Your `.env` file should now have:

```env
# AI API Keys
EXPO_PUBLIC_OPENAI_API_KEY=...
EXPO_PUBLIC_FASTROUTER_API_KEY=...

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Google Sign-In (NEW)
EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

## Code Changes

### Files Modified:
1. **src/services/firebaseAuthService.ts**
   - Added `signInWithGoogle()` function
   - Added `sendPhoneVerification()` function
   - Added `verifyPhoneCode()` function
   - Configured Google Sign-In

2. **src/screens/AuthScreen.tsx**
   - Added Google Sign-In button
   - Added Phone Sign-In button (placeholder)
   - Added "OR" divider
   - Updated UI styling

3. **package.json**
   - Added `@react-native-google-signin/google-signin`

4. **app.json**
   - Added Google Sign-In plugin

5. **.env & .env.example**
   - Added `EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID`

## Testing Checklist

- [ ] Email/Password sign-in works
- [ ] Email/Password sign-up works
- [ ] Google Sign-In button appears
- [ ] Google Sign-In flow works
- [ ] Phone button shows "coming soon" message
- [ ] User data syncs to Firebase
- [ ] Auto-login works after restart

## Production Considerations

### For Google Sign-In:
1. Generate production SHA-1 fingerprint
2. Add to Firebase Console
3. Test on physical devices
4. Verify OAuth consent screen is configured

### For Phone Authentication:
1. Set up reCAPTCHA for web
2. Configure APNs for iOS
3. Add phone number verification UI
4. Implement OTP input screen
5. Handle verification errors

## Next Steps

1. **Get Web Client ID** from Firebase Console
2. **Add to .env** file
3. **Add SHA-1 fingerprint** to Firebase (for Android)
4. **Restart app** and test Google Sign-In
5. **(Optional)** Implement full phone authentication

---

**Status:** Google Sign-In ready to test! Phone authentication is placeholder for now.

*Updated: December 5, 2025*
