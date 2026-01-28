#!/bin/bash
# Script to get Android app fingerprint for Google OAuth
# This will be generated after your first EAS build

echo "🔐 Getting Android App Fingerprint for Google OAuth"
echo ""
echo "Option 1: After your first EAS build, run:"
echo "  npx eas-cli credentials --platform android"
echo "  Then select 'Show credentials' and look for SHA-1 and SHA-256 fingerprints"
echo ""
echo "Option 2: If you have the keystore file, run:"
echo "  keytool -list -v -keystore <path-to-keystore> -alias <alias-name>"
echo ""
echo "Option 3: Create a preview build first:"
echo "  npx eas-cli build --platform android --profile preview"
echo "  After the build completes, the keystore will be created and you can get the fingerprint"
echo ""
echo "📝 Once you have the SHA-1 and SHA-256 fingerprints, add them to:"
echo "   Google Cloud Console → APIs & Credentials → OAuth 2.0 Client ID → Android app"
echo ""
