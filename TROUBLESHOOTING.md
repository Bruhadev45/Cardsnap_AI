# Troubleshooting Guide

## AI Model Errors: "No available model provider"

If you see errors like:
```
ERROR Model google/gemini-2.0-flash-exp failed: 400 "There is no available model provider that meets your routing requirements"
```

### Possible Causes & Solutions:

#### 1. Environment Variable Not Loaded
**Problem:** The `.env` file changes require a server restart.

**Solution:**
```bash
# Stop the current Expo server (Ctrl+C)
# Then restart:
npm start
```

#### 2. Invalid or Expired API Key
**Problem:** Your FastRouter API key might be invalid, expired, or doesn't have access to certain models.

**Solution:**
- Go to https://fastrouter.ai/ and check your API key
- Verify your account has credits/access
- Generate a new API key if needed
- Update `.env` with the new key:
  ```
  EXPO_PUBLIC_FASTROUTER_API_KEY=your-new-key-here
  ```
- Restart Expo server

#### 3. Model Availability
**Problem:** Some models might not be available on your FastRouter plan.

**Solution:**
The app now tries multiple models in this order:
1. `openai/gpt-4o-mini` (most reliable, fast, cheap)
2. `openai/gpt-4o` (more powerful)
3. `google/gemini-2.0-flash-exp` (experimental)
4. `google/gemini-1.5-flash` (fast)
5. `google/gemini-1.5-pro` (powerful)
6. `anthropic/claude-3-5-sonnet` (alternative)

OpenAI models are generally more reliable on FastRouter.

#### 4. Check API Key is Loading
**Look for this in your console when app starts:**
```
✅ FastRouter API key loaded: sk-v1-705d...
```

**If you see this instead:**
```
⚠️ EXPO_PUBLIC_FASTROUTER_API_KEY is not set in environment variables
```

Then your `.env` file isn't being read. Make sure:
- File is named exactly `.env` (not `.env.txt`)
- File is in the root directory (same level as `package.json`)
- You restarted the Expo server after creating/editing it
- Variables start with `EXPO_PUBLIC_` prefix

#### 5. Test Your API Key
You can test your FastRouter API key with curl:

```bash
curl https://go.fastrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "model": "openai/gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

If this fails, your API key is invalid.

## Firebase Errors

### "Firebase configuration is incomplete"
**Solution:** Check your `.env` file has all Firebase variables:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

### "User not logged in"
**Solution:** Make sure you're logged in before scanning cards or accessing features.

## Camera Issues

### "Camera permission denied"
**Solution:**
- Go to device Settings → Apps → CardSnap AI → Permissions
- Enable Camera permission
- Restart the app

### "Camera not working"
**Solution:**
```bash
# Clear cache and restart
expo start -c
```

## Build Issues

### "Invalid UUID appId"
**Solution:** Run `eas project:init` to create a valid project ID.

### Environment variables not in build
**Solution:** Add them as EAS secrets:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_FASTROUTER_API_KEY --value "your-key"
```

## Quick Fixes

### Reset Everything
```bash
# Stop server
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
expo start -c
```

### Check Logs
Look for these indicators in your console:
- ✅ = Working correctly
- ⚠️ = Warning, might cause issues
- ❌ = Error, needs fixing

## Still Having Issues?

1. Check the console logs for specific error messages
2. Verify all environment variables are set correctly
3. Make sure you restarted the Expo server
4. Try using a different model (OpenAI models are most reliable)
5. Test your API key with curl command above
