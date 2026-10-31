# How to Test Expo Push Notifications — Step by Step

## Prerequisites

1. **Use a physical device.** Push notifications do **not** work on:
   - iOS Simulator  
   - Android Emulator  

2. **Use a development build** (e.g. `eas build` or `npx expo run:ios` / `run:android`). Expo Go may work for basic testing but a dev build is recommended.

3. **Allow notifications** when the app asks for permission (on first launch or when opening a screen that requests the token).

---

## Step 1: Get your Expo Push Token

1. Open the app on your **physical device**.
2. Complete flow until you reach the **Home** tab (log in if required).
3. **Option A — From logs**
   - With the app open and on Home, check your **Metro/terminal** where `npm run ios` or `npm run android` is running.
   - You should see: `Expo Push Token: ExponentPushToken[xxxxx]`
   - Copy the full token (e.g. `ExponentPushToken[abc123...]`).
4. **Option B — From the app**
   - Go to **Settings** (tab or profile).
   - Tap **"Push notification test"**.
   - The screen shows your **Device token**. Copy it (or leave the app open and type it into the test page).

You need this token for Step 2.

---

## Step 2: Send a test notification

Choose **one** of these:

### Option A — From the app (easiest)

1. Stay on **Settings → Push notification test**.
2. Tap **"Send test notification"**.
3. Wait a few seconds. You should get a notification on the same device with title **"Test notification"** and a body message, with sound.

### Option B — From the test HTML page

1. On your computer, open the file **`docs/push-notification-test.html`** in a browser (double‑click or drag into Chrome/Safari).
2. In the **Expo Push Token** field, paste the token from Step 1 (from Home logs or from Settings → Push notification test).
3. Optionally change **Title** and **Body**.
4. Click **"Send notification"**.
5. If the request fails (e.g. CORS), the page will show a **curl** command. Copy it and run it in your terminal — replace nothing; the token is already in the command.

### Option C — From the terminal (curl)

1. Open Terminal (or Command Prompt).
2. Run (replace the token with yours from Step 1):

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"to":"ExponentPushToken[YOUR_TOKEN_HERE]","sound":"default","title":"Test","body":"Hello from curl"}'
```

3. Replace `ExponentPushToken[YOUR_TOKEN_HERE]` with your actual token (e.g. `ExponentPushToken[abc123xyz]`).

---

## Step 3: Check the result

- **Success:** Your device shows a notification with the title and body you sent. It should play the default sound and use your app icon.
- **No notification:**  
  - Confirm you’re on a **physical device** (not simulator/emulator).  
  - Confirm you **allowed notifications** for the app.  
  - Confirm the token is correct (no extra spaces, full `ExponentPushToken[...]`).  
  - For Option B (browser), if it failed, use the **curl** command shown on the page instead.

---

## Quick checklist

| Step | Action |
|------|--------|
| 1 | Use a **physical device** and open the app. |
| 2 | Go to **Home** (token is logged) or **Settings → Push notification test** (token is shown). |
| 3 | Copy the **Expo Push Token**. |
| 4 | Send a test: **in-app** (Send test notification), **HTML page**, or **curl**. |
| 5 | Confirm the notification appears on the device with title, body, and sound. |

---

## Troubleshooting

- **"No token" on Push notification test screen**  
  You’re likely on a simulator/emulator, or notifications were denied. Use a real device and allow notifications.

- **Token in logs but no notification when sending**  
  Double-check the token is copied completely. Try sending from the **in-app** "Send test notification" button (Option A).

- **Build/run commands**  
  - iOS: `npx expo run:ios` (with device selected) or `eas build --platform ios` then install.  
  - Android: `npx expo run:android` (with device connected) or `eas build --platform android` then install.
