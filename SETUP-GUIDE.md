# Quick Setup Guide

Follow these steps to get CardSnap AI running on your device.

## ✅ Step 1: Install Dependencies

```bash
npm install
```

## ✅ Step 2: Configure Environment Variables

Your `.env` file is already configured with:
- ✅ OpenAI API Key
- ✅ FastRouter API Key (backup)
- ✅ Firebase Configuration

**No changes needed!** The app will use OpenAI by default.

## ✅ Step 3: Verify Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Open project: `cardsnap-ai-4d0ce`
3. Verify these are enabled:
   - **Authentication** → Email/Password provider
   - **Firestore Database** → Created and active

## ✅ Step 4: Start the App

```bash
npm start
```

You should see in the console:
```
✅ Using OpenAI API key: sk-proj-4N_EA...
```

## ✅ Step 5: Run on Device

### Option A: Physical Device (Recommended)
1. Install **Expo Go** app:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code from terminal
3. App will load on your device

### Option B: Emulator/Simulator
```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android
```

## 🎯 Test the App

1. **Register/Login**: Create an account or login
2. **Scan Card**: Tap the scan button and take a photo of a business card
3. **Review**: AI will extract contact information
4. **Save**: Confirm and save to your contacts
5. **AI Assistant**: Tap the chat icon to ask questions about your contacts

## 🔧 Troubleshooting

### App won't start?
```bash
# Clear cache and restart
expo start -c
```

### Environment variables not loading?
- Make sure you restarted the Expo server after editing `.env`
- Check that variables start with `EXPO_PUBLIC_`

### AI not working?
- Check console for: `✅ Using OpenAI API key`
- Verify your OpenAI API key has credits
- Test at: https://platform.openai.com/playground

### Firebase errors?
- Verify Email/Password auth is enabled in Firebase Console
- Check Firestore database exists
- Ensure all Firebase env variables are set

## 📱 Building APK/IPA

See [README.md](./README.md#building-for-production) for production build instructions.

## 🆘 Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions
- Review [README.md](./README.md) for full documentation
- Check console logs for error messages

## 🎉 You're All Set!

Your CardSnap AI app is ready to use. Start scanning business cards and let AI do the work!
