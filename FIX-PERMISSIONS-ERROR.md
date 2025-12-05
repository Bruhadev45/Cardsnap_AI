# 🔥 FIX: Firebase Storage Permission Error

## Error You're Seeing
```
ERROR Fetch error: [FirebaseError: Missing or insufficient permissions.]
```

## Why This Happens
Firebase Storage has security rules that block uploads by default. You MUST configure the rules to allow authenticated users to upload images.

---

## ⚡ QUICK FIX (5 Minutes)

### Step 1: Open Firebase Console
Go to: **https://console.firebase.google.com/**

### Step 2: Select Your Project
Click on your CardSnap project

### Step 3: Go to Storage Rules
1. Click **Storage** in the left sidebar
2. Click the **Rules** tab at the top

### Step 4: Copy & Paste These Rules

**Delete everything** in the rules editor and replace with:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to manage their own contact images
    match /contacts/{userId}/{contactId}/{imageName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 5: Publish
Click the **Publish** button (top right)

### Step 6: Test the App
1. Restart your app: `npm start`
2. Scan a business card
3. Check console - you should see:

```
✅ Upload successful: contacts/.../front.jpg
✅ Front image uploaded successfully
✅ Contact saved to Firestore successfully
```

---

## 🎯 Alternative: Allow All Authenticated Users (Easier but Less Secure)

If you just want to test quickly, use this simpler rule:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note:** This allows any logged-in user to read/write any file. Use for testing only!

---

## ✅ Current App Behavior (Until Rules Are Fixed)

The app will now:
- ✅ Still scan and extract contact data (OCR works)
- ✅ Save contact info to Firestore
- ⚠️  Skip saving images (to avoid 1MB limit)
- ⚠️  Show clear error message in console

**After you fix the rules:**
- ✅ Images will upload to Storage
- ✅ Everything will work perfectly!

---

## 🔍 Verify Rules Are Working

After publishing rules, test by scanning a card. Console should show:

```
Starting image upload...
Converting base64 to Blob...
Blob created, size: 184308 bytes
Uploading to Firebase Storage...
✅ Upload successful: contacts/YOUR_USER_ID/CONTACT_ID/front.jpg
✅ Download URL obtained: https://firebasestorage...
```

If you still see errors, double-check:
1. ✅ Rules published successfully
2. ✅ User is logged in
3. ✅ Storage bucket name matches in .env file

---

## 📸 Screenshot Guide

1. Firebase Console → Your Project
2. Left sidebar → **Storage**
3. Top tabs → **Rules**
4. Paste the rules from Step 4
5. Click **Publish**

Done! 🎉

---

**Need Help?** 
- Check that Storage is enabled in your Firebase project
- Verify your .env has the correct EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET value
- Make sure you're logged into the app before scanning
