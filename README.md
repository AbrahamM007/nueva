# Welcome to the App 👋

This is a multi-functional [React Native](https://reactnative.dev) application built with [Expo](https://expo.dev). The app integrates features like user authentication, ministry and event management, chat functionalities, and YouTube integration.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory.

## Features

### User Authentication
- **Login and Signup:** Secure authentication flow.
- **Validation:** Password confirmation and user input checks.
- **Persistence:** Keeps users logged in using `AsyncStorage`.

### Navigation
- **Screens:**
  - `login`, `signup`, `home`, `apps`, `watch`, `profile`
- **Apps Sub-Screens:**
  - `main`, `ministry`, `events`, `bible`, `services`, `chatList`, `chatConversation`
- **Tab Bar:** Smooth navigation between screens.

### Ministries Management
- Add new ministries with titles, descriptions, and associated members.
- Modal-based creation form for easy input.

### Event Management
- Plan events with titles, dates, times, and descriptions.
- List and view all planned events.

### Services Planning
- Plan services with details like dates, songs, and timelines.
- View a chronological list of all services.

### Chat Functionality
- View all users (excluding logged-in user) in the chat list.
- Start conversations with real-time styled chat bubbles.

### Bible Screen
- Fetch Bible passages (e.g., John 3:16) using an external API.

### Video Integration
- Display the latest video from a YouTube channel using `react-native-youtube-iframe`.

### Profile Management
- View and edit profile details, including uploading a profile picture.

## State Management
The app uses React's `useState` and `useEffect` for managing states such as:
- User authentication and navigation.
- Ministries, events, services, and chat messages.

## AsyncStorage
- **Persistence:** Saves user data like ministries, events, services, and chat messages.
- **Auto-Save:** Updates data whenever states change.

## API Integration
- **Bible API:** Fetches and displays Bible passages.
- **YouTube API:** Retrieves the latest video from a predefined channel.

## Styling
- **Responsive Design:** Uses `StyleSheet` for consistent styling.
- **Modern UI:** Green-themed palette for a calming effect.

## Libraries and Dependencies
- **React Native**: Core framework.
- **Ionicons**: Icon library for visual appeal.
- **AsyncStorage**: For persistent storage.
- **react-native-youtube-iframe**: Embeds YouTube videos.
- **expo-image-picker**: For uploading profile pictures.

## Learn more
To learn more about developing with Expo, check these resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals or dive into advanced topics.
- [React Native docs](https://reactnative.dev): Comprehensive documentation for React Native development.

## Join the community
Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View and contribute to the open-source platform.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

