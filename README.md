# AEON Bank Transactions

A React Native CLI assessment app for browsing recent transactions and viewing a receipt-style detail screen. It supports search, incoming and outgoing filters, an on-screen amount privacy toggle, and sharing transaction receipts with the native share sheet. Transaction records are mock data stored in the app; there is no backend.

## Stack

- React Native 0.88, React 19, and TypeScript
- React Navigation native stack
- Zustand for the shared, in-memory privacy setting
- React Native `Share` and `Intl` APIs

## Structure

- `src/features/transactions/presentation` — screens, navigation, components, and privacy state
- `src/features/transactions/domain` — transaction type, repository contract, and retrieval use cases
- `src/features/transactions/data` — mock records and repository implementation
- `src/constants` — shared UI strings, colors, dimensions, and typography

## Run the app

Use Node.js 22.11 or newer and follow the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for your platform.

Install JavaScript dependencies and start Metro:

```sh
npm install
npm start
```

In a second terminal, run the app on a connected Android device or emulator:

```sh
npm run android
```

For iOS, install the CocoaPods dependencies once (or after native dependencies change), then run the app:

```sh
bundle install
cd ios
bundle exec pod install
cd ..
npm run ios
```

Run the configured lint check with:

```sh
npm run lint
```
