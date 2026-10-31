# Earno 🚀

Earno is a comprehensive investment platform built with Expo and React Native, designed to bridge the gap between project owners, investors, and marketers.

## 🌟 Features

- **Multi-Role Support**: 
  - **Investor**: Browse and analyze investment opportunities.
  - **Project Owner**: Showcase projects and attract potential investors.
  - **Marketer**: Promote the platform and earn commissions.
- **Project Discovery**: Advanced filtering by city, investment size, opportunity type (Partnership, Acquisition, etc.), and project status.
- **Multilingual Support**: Fully localized in English and Arabic with RTL support.
- **Themed UI**: Modern, clean interface with light and dark mode support.
- **Detailed Insights**: View project metrics like expected return, capital recovery period, and partnership percentages.

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) / [React Native](https://reactnative.dev)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction) (File-based routing)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Localization**: [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/)
- **Icons**: [Ionicons](https://icons.expo.fyi/) (via `@expo/vector-icons`)
- **State/Theme**: Custom hooks for color schemes and theme management.

## 📁 Project Structure

```text
app/                 # Main application routes (Expo Router)
  (tabs)/            # Bottom tab navigation screens
  account-type/      # Account selection flow
  login/             # Authentication - Login
  register/          # Authentication - Registration
  project-details/   # Detailed view for projects
  splash/            # Custom splash screen
assets/              # Local assets (fonts, images, locales)
components/          # Reusable UI components
constants/           # Theme, colors, and font configurations
hooks/               # Custom React hooks
utils/               # Utility functions (i18n, etc.)
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npx expo start
```

In the output, you'll find options to open the app in a:
- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

## 📄 License

This project is private and proprietary.
