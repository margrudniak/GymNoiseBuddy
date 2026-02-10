# Gym Noise Buddy

Minimal React Native app (Expo) that measures ambient gym noise and suggests when a zone is too loud for focused training.

## Features

- Live microphone-based noise meter (`~dB` approximation)
- Focus suggestion when level is loud:
  - `Too loud for focus -> ANC / other zone.`
- Manual gym zone management
- Favorite zones
- Local persistence with AsyncStorage
- Tailwind styling via NativeWind

## Tech Stack

- Expo (React Native + TypeScript)
- React Navigation (bottom tabs)
- Expo AV (microphone metering)
- NativeWind + Tailwind CSS
- AsyncStorage

## Quick Start

```bash
npm install
npx expo start -c
```

Run on:
- iOS simulator / device (`i` in Expo CLI)
- Android emulator / device (`a` in Expo CLI)

## Scripts

```bash
npm run start
npm run ios
npm run android
npm run web
```

## Project Structure

```text
App.tsx
src/
  components/
  screens/
  store/
  utils/
```

## Notes

- Noise value is approximate and not a calibrated SPL reading.
- Microphone permission is required for live metering.
