# How to Get SHA-1 Fingerprint from EAS Keystore

## Method 1: Using EAS CLI (Recommended)

Run this command in your terminal:
```bash
cd /Users/amitojsinghahuja/Desktop/idealot/apps/mobile
npx eas-cli credentials --platform android
```

**Steps:**
1. When prompted, select **"development"** (or the profile you used)
2. Select **"Show credentials"** or **"View credentials"**
3. Look for **SHA-1 certificate fingerprint**
4. Copy the entire SHA-1 (it looks like: `AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE`)

## Method 2: After Building

If you've already built the app, the SHA-1 might be shown in the build output. Check your build logs.

## Method 3: Using EAS API (Advanced)

If you have EAS API access, you can query credentials programmatically, but the CLI method above is easier.

## What to Do Next

Once you have the SHA-1 fingerprint:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials

2. **Find your Android OAuth Client:**
   - Look for: `565801059910-27254364djldvncd7app299av0qvg4ab.apps.googleusercontent.com`
   - Or search for "Android" in your OAuth 2.0 Client IDs

3. **Edit the Android Client:**
   - Click on the client ID
   - Click **Edit**

4. **Add SHA-1 Fingerprint:**
   - Scroll to **SHA-1 certificate fingerprints**
   - Click **+ ADD FINGERPRINT**
   - Paste your SHA-1 fingerprint
   - Click **Save**

5. **Verify Package Name:**
   - Make sure the package name is: `com.zensthub.ideafy`
   - If it's different, update it to match your app

6. **Wait 5-10 minutes** for changes to propagate

7. **Rebuild and Test:**
   ```bash
   npx eas-cli build --platform android --profile development
   ```

## Important Notes

- The SHA-1 fingerprint is unique to your keystore
- If you regenerate the keystore, you'll get a new SHA-1
- You can add multiple SHA-1 fingerprints (useful for debug and release builds)
- The package name in Google Cloud Console must exactly match: `com.zensthub.ideafy`
