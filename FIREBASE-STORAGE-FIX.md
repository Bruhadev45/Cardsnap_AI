# Firebase Storage Setup Guide

## ✅ FIXED: ArrayBuffer Error
The "Creating blobs from 'ArrayBuffer' and 'ArrayBufferView' are not supported" error has been fixed!

The app now properly converts base64 images to Blobs before uploading to Firebase Storage.

## Required: Set Up Firebase Storage Rules

Firebase Storage requires proper security rules to allow uploads. **You must configure these rules for the app to work.**

## Solution: Update Firebase Storage Rules

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com/
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update Storage Rules

Replace the existing rules with:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload/read their own contact images
    match /contacts/{userId}/{contactId}/{imageName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Alternatively, for development/testing only (less secure):
    // match /{allPaths=**} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

### Step 3: Publish the Rules
Click **Publish** to save the changes.

## What These Rules Do

- **read**: Users can only read images they uploaded (their userId matches)
- **write**: Users can only upload images to their own folder
- **Authentication required**: Only logged-in users can access Storage

## Check the Console Logs

The app now logs detailed error information. Check your console for:

```
Starting image upload...
User ID: <userId>
Contact ID: <contactId>
Storage reference created: contacts/<userId>/<contactId>/front.jpg
```

Look for error details like:
- `code: "storage/unauthorized"` → Storage rules issue (use solution above)
- `code: "storage/quota-exceeded"` → You've exceeded Firebase free tier limits
- `code: "storage/unknown"` → Check your internet connection

## Fallback Behavior

The app now has a fallback:
- **First**: Tries to upload to Firebase Storage
- **If fails**: Stores base64 image in Firestore (may hit 1MB limit for large images)

## Testing

After updating the rules:
1. Restart your app
2. Try scanning a business card
3. Check console for "Upload successful" message
4. Verify image appears in Firebase Storage (Console → Storage → Files)

## Still Having Issues?

Check:
1. ✅ Firebase Storage is enabled in your project
2. ✅ Your `.env` file has the correct `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
3. ✅ User is authenticated (logged in)
4. ✅ Internet connection is stable
5. ✅ Firebase project has Storage quota remaining

Run this to see detailed logs:
```bash
npm start
```

Then scan a card and check the console output for the exact error code.
