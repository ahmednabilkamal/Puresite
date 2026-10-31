# Expo Push Notifications Setup (no Firebase in app)

This app uses **Expo Push Notifications** only. No Firebase SDK or `google-services.json` in the project. Notifications are sent via Expo's API; title, body, sound, and app icon (launcher icon) are supported.

---

## 1. What’s already done in the project

- **Libraries**: `expo-notifications`, `expo-device`, `expo-constants` are installed.
- **Config**: `expo-notifications` plugin in `app.json` (no Firebase in app).
- **Code**: In `utils/push-notifications.ts`:
  - `setNotificationHandler()` – how notifications look in foreground.
  - `registerForPushNotificationsAsync()` – requests permission and returns the **Expo push token**.
- **App**: The root layout calls the handler and registers for push when the user is authenticated. You can send the token to your backend when you have an endpoint.

---

## 2. Steps to finish setup

### Step 1: Use a physical device

Push notifications do **not** work on:

- Android Emulator  
- iOS Simulator  

Use a real device for testing.

---

### Step 2: Android – Firebase (FCM)

You need **two things from Firebase** for Android:

#### A. `google-services.json`

1. Go to [Firebase Console](https://console.firebase.google.com).
2. Create a project (or use an existing one).
3. Add an **Android app**:
   - Package name: **`com.anonymous.PureSite`** (must match `app.json` → `expo.android.package`).
   - Download **`google-services.json`**.
4. Put `google-services.json` in the **project root** (same folder as `app.json`).
5. In `app.json` the path is already set:  
   `"googleServicesFile": "./google-services.json"`.

If you are **not** using Firebase yet:

- You can remove or comment out the `googleServicesFile` line in `app.json` so the Android build doesn’t expect the file.
- Add it back once you have the file from Firebase.

#### B. FCM V1 service account key (for sending notifications)

Expo uses this to send push notifications to Android devices.

1. In Firebase Console: **Project settings** (gear) → **Service accounts**.
2. Click **Generate new private key** and confirm.  
   A JSON file is downloaded (e.g. `my-project-firebase-adminsdk-xxxxx.json`).
3. **Do not commit this file.** Add it to `.gitignore`, for example:
   - `*-firebase-adminsdk-*.json`
   - or the exact filename.
4. Upload this JSON to **EAS**:
   - **Option A – EAS CLI**
     - Run: `eas credentials`
     - Choose: **Android** → **production** (or the profile you use) → **Google Service Account**.
     - Choose: **Manage … FCM V1** → **Set up …** → **Upload a new service account key**.
     - Select the downloaded JSON when prompted.
   - **Option B – EAS Dashboard**
     - Open your project on [expo.dev](https://expo.dev) → **Credentials**.
     - Under **Android**, select your application identifier.
     - Under **FCM V1 service account key** → **Add a service account key** → upload the JSON.

After this, Expo can send push notifications to Android via FCM.

---

### Step 3: iOS (optional)

- You need an **Apple Developer account**.
- When you run `eas build` for iOS, EAS will prompt to set up push notifications and can generate an Apple Push Notifications key.
- Register your test device if you use development builds.

---

### Step 4: Build the app

```bash
eas build --platform android
# or
eas build --platform ios
# or both
eas build --platform all
```

Install the built app on a **physical device**.

---

### Step 5: Get the push token and test

1. Start the app: `npx expo start`, then open the **development build** on your device (not Expo Go for production push).
2. Log in so the app runs `registerForPushNotificationsAsync()`. Accept the notification permission if asked.
3. In development, the Expo push token is logged (e.g. in Metro):  
   `Expo push token: ExponentPushToken[xxxxx]`.
4. Send a test notification:
   - Go to [Expo Push Notifications tool](https://expo.dev/notifications).
   - Paste the **Expo push token**.
   - Enter title and body, then send. You should see the notification on the device.

---

## 3. Sending notifications from your backend

- **Expo Push API**: Send a POST request to `https://exp.host/--/api/v2/push/send` with a body like:

```json
{
  "to": "ExponentPushToken[xxxxx]",
  "sound": "default",
  "title": "Your title",
  "body": "Your message",
  "data": { "key": "value" }
}
```

Replace `ExponentPushToken[xxxxx]` with the token from **Settings → Push notification test** (or from dev logs).

- Store the **Expo push token** per user (e.g. when the app calls your API after `registerForPushNotificationsAsync()`). Example endpoint: `POST /notifications/register` with `{ "push_token": "ExponentPushToken[xxx]" }`.
- You can use the Expo server SDK (e.g. `expo-server-sdk` in Node) to send to many tokens.

---

## 4. Checklist – what you need from Firebase (Android)

| Item | Where to get it | Where it goes |
|------|-----------------|----------------|
| **google-services.json** | Firebase Console → Project settings → Your apps → Android app → Download | Project root; path in `app.json` is already set. |
| **FCM V1 service account key** (JSON) | Firebase Console → Project settings → Service accounts → Generate new private key | Upload to EAS (Credentials → Android → FCM V1). Do not commit. |

After both are in place and you’ve run a new EAS build, Android push notifications can be sent via Expo’s push service (which uses FCM under the hood).
