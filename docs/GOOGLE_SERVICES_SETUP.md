# google-services.json Setup

The project is configured to use `google-services.json` for Android (Expo/React Native).

## Get the real file from Firebase

1. Open [Firebase Console](https://console.firebase.google.com).
2. Select your project (or create one).
3. Go to **Project settings** (gear) → **Your apps**.
4. If you haven’t added an Android app, click **Add app** → **Android**.
5. **Android package name:** use `com.afsc.PureSite` (must match `app.json`).
6. Download **google-services.json**.
7. Replace the file at the **project root**:  
   `puresite_reactnative/google-services.json`  
   with the downloaded file.

The placeholder file in the repo has the correct `package_name`; replace it entirely with the file from Firebase so it contains your real `project_id`, `api_key`, and `mobilesdk_app_id`.

## After updating

Run a clean build so the new config is picked up:

- `npx expo prebuild --clean` then `npx expo run:android`
- or a new EAS build: `eas build --platform android`
