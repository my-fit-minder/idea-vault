# Fix Native Google Sign-In (DEVELOPER_ERROR code 10)

## Quick Diagnosis

The DEVELOPER_ERROR (code 10) means your Google OAuth client configuration is incomplete. Follow the steps below based on your platform.

## For Android

### Step 1: Get SHA-1 Fingerprint

**Option A: Using EAS CLI (Recommended)**

Run this command in your terminal:
```bash
cd apps/mobile
npx eas-cli credentials --platform android
```

When prompted:
1. Select **"development"** profile (or the profile you used for your build)
2. Select **"Show credentials"** or **"View credentials"**
3. Look for **SHA-1 certificate fingerprint** (looks like: `AA:BB:CC:DD:EE:FF:...`)
4. Copy the entire SHA-1 fingerprint

**Option B: If you haven't built yet**

If you haven't created a build yet, you'll need to create one first:
```bash
npx eas-cli build --platform android --profile development
```

After the build completes, run the credentials command above to get the SHA-1.

### Step 2: Add SHA-1 to Google Cloud Console

1. Go to [Google Cloud Console → APIs & Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your **Android OAuth 2.0 Client ID**: `565801059910-27254364djldvncd7app299av0qvg4ab.apps.googleusercontent.com`
3. Click **Edit**
4. Under **SHA-1 certificate fingerprints**, click **+ ADD FINGERPRINT**
5. Paste your SHA-1 fingerprint
6. Click **Save**

### Step 3: Verify Configuration

- ✅ Package name: `com.zensthub.ideafy`
- ✅ SHA-1 fingerprint: Added
- ✅ Web Client ID: `565801059910-b2g42nn3pak9aa9ionstrhfl8l45e5a3.apps.googleusercontent.com`

### Step 4: Rebuild the App

After adding the SHA-1, rebuild your development build:
```bash
npx eas-cli build --platform android --profile development
```

## For iOS

### Step 1: Verify iOS Client Configuration

1. Go to [Google Cloud Console → APIs & Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your **iOS OAuth 2.0 Client ID**: `565801059910-5c9rf0khttimdesh5gkeagmr8crsrj3e.apps.googleusercontent.com`
3. Verify:
   - ✅ Bundle ID: `com.zensthub.ideafy`
   - ✅ App Store ID: (optional, if published)
   - ✅ Team ID: (optional, if published)

### Step 2: Verify Web Client ID

1. Go to your **Web OAuth Client**: `565801059910-b2g42nn3pak9aa9ionstrhfl8l45e5a3.apps.googleusercontent.com`
2. Make sure it's properly configured
3. The Web Client ID must be linked to your iOS client

### Step 3: Verify app.json Configuration

Check that `app.json` has:
```json
{
  "ios": {
    "infoPlist": {
      "CFBundleURLTypes": [
        {
          "CFBundleURLSchemes": [
            "ideafy",
            "com.googleusercontent.apps.565801059910-5c9rf0khttimdesh5gkeagmr8crsrj3e"
          ]
        }
      ]
    }
  },
  "plugins": [
    [
      "@react-native-google-signin/google-signin",
      {
        "iosUrlScheme": "com.googleusercontent.apps.565801059910-5c9rf0khttimdesh5gkeagmr8crsrj3e"
      }
    ]
  ]
}
```

### Step 4: Rebuild the App

After verifying configuration, rebuild:
```bash
npx eas-cli build --platform ios --profile development
```

## Common Issues

### Issue: "DEVELOPER_ERROR" persists after adding SHA-1

**Solution:**
1. Wait 5-10 minutes for Google Cloud Console changes to propagate
2. Make sure you're using the correct Web Client ID (not iOS/Android specific)
3. Verify the package name/bundle ID matches exactly
4. Try clearing app data and reinstalling

### Issue: Native sign-in still doesn't work

**Solution:**
1. Check logs in the app - they will show which configuration is missing
2. Verify all Client IDs are added to Supabase Dashboard
3. Make sure you're using a development build (not Expo Go)
4. The native module requires a rebuild after configuration changes

## Verification

After fixing the configuration:

1. **Rebuild your development build**
2. **Install the new build on your device**
3. **Try Google Sign-In** - it should use native UI (no browser)
4. **Check logs** - you should see "✅ Google Sign-In successful"

## Still Having Issues?

Check the app logs for specific error messages. The code will now show detailed diagnostics about what's missing.
