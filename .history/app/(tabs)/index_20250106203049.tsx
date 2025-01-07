// App.tsx (Single-File Example)

// -------------------------------
// 1. Imports & Type Definitions
// -------------------------------
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import YoutubeIframe from "react-native-youtube-iframe";
import AsyncStorage from "@react-native-async-storage/async-storage";

// For image uploads
import { launchImageLibrary } from "react-native-image-picker"; 
// or for Expo: import * as ImagePicker from 'expo-image-picker';

interface User {
  id: string;          // Unique ID
  name: string;        // Display name
  email: string;
  password: string;
  photoUrl?: string;   // Profile image
}

interface Ministry {
  id: string;
  title: string;
  description: string;
  // Who created it?
  createdBy: string;   // userId or userName
  people: string[];    // array of user IDs that joined
}

interface EventItem {
  id: string;
  title: string;
  date: string;     // or a Date object
  time: string;     // or combine with date if you prefer
  description: string;
  createdBy: string;    // userId or ministryId
  assignedToMinistry?: string; // optional ministry ID
  attendees: string[];  // user IDs
}

// For your screens
type Screen = "login" | "signup" | "home" | "apps" | "watch" | "profile";

// We’ll have separate “pages” for Ministries & Events, 
// navigated from the Apps screen
type AppsSubScreen = "main" | "ministry" | "events";

// ---------------------------------------
// 2. Main App with Single-File Navigation
// ---------------------------------------
const App: React.FC = () => {
  // ----------------------
  // 2.1. Auth & Navigation
  // ----------------------
  const [currentAuthScreen, setCurrentAuthScreen] = useState<"login" | "signup">("login");
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [appsSubScreen, setAppsSubScreen] = useState<AppsSubScreen>("main");

  // Bottom nav tab
  const [activeTab, setActiveTab] = useState<"home" | "watch" | "apps" | "profile">("home");

  // 2.2. Auth States
  const [users, setUsers] = useState<User[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2.3. Data: Ministries & Events
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  // 2.4. YouTube
  const [latestVideoId, setLatestVideoId] = useState<string>("");
  const [loadingVideo, setLoadingVideo] = useState(false);

  // 2.5. UI Toggles
  const [isGridView, setIsGridView] = useState(true);

  // 2.6. Profile-Image Upload (handled in profile below)
  // 2.7. Modals for Creating Ministries / Events
  const [showMinistryModal, setShowMinistryModal] = useState(false);
  const [ministryTitle, setMinistryTitle] = useState("");
  const [ministryDescription, setMinistryDescription] = useState("");
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [assignedMinistry, setAssignedMinistry] = useState<string | null>(null);
  const [eventAttendees, setEventAttendees] = useState<string[]>([]);

  // ----------------------
  // 3. useEffect & AsyncStorage
  // ----------------------
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem("@all_users");
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }

      const storedMinistries = await AsyncStorage.getItem("@all_ministries");
      if (storedMinistries) {
        setMinistries(JSON.parse(storedMinistries));
      }

      const storedEvents = await AsyncStorage.getItem("@all_events");
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }

      const storedLoggedIn = await AsyncStorage.getItem("@logged_in_user");
      if (storedLoggedIn) {
        const parsedUser = JSON.parse(storedLoggedIn) as User;
        setLoggedInUser(parsedUser);
        // Move to home if a user is logged in
        setCurrentScreen("home");
      }
    } catch (error) {
      console.log("Error loading data from AsyncStorage", error);
    }
  };

  const saveAllData = async () => {
    try {
      await AsyncStorage.setItem("@all_users", JSON.stringify(users));
      await AsyncStorage.setItem("@all_ministries", JSON.stringify(ministries));
      await AsyncStorage.setItem("@all_events", JSON.stringify(events));
      if (loggedInUser) {
        await AsyncStorage.setItem("@logged_in_user", JSON.stringify(loggedInUser));
      } else {
        await AsyncStorage.removeItem("@logged_in_user");
      }
    } catch (error) {
      console.log("Error saving data", error);
    }
  };

  useEffect(() => {
    // Save data whenever these states change
    saveAllData();
  }, [users, ministries, events, loggedInUser]);

  // ----------------------
  // 4. Auth Handlers
  // ----------------------
  const handleLogin = () => {
    const foundUser = users.find((u) => u.email === authEmail && u.password === authPassword);
    if (!foundUser) {
      Alert.alert("Error", "Invalid credentials or user does not exist.");
      return;
    }
    setLoggedInUser(foundUser);
    AsyncStorage.setItem("@logged_in_user", JSON.stringify(foundUser));
    setCurrentScreen("home");
    setActiveTab("home");
  };

  const handleSignup = () => {
    if (!authName.trim() || authEmail.length < 3 || authPassword.length < 3) {
      Alert.alert("Error", "Name, Email, and Password must be valid (>=3 chars).");
      return;
    }
    if (authPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    const existing = users.some((u) => u.email === authEmail);
    if (existing) {
      Alert.alert("Error", "User with that email already exists.");
      return;
    }
    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name: authName.trim(),
      email: authEmail.trim(),
      password: authPassword,
      photoUrl: "", // will set later
    };
    setUsers([...users, newUser]);
    setLoggedInUser(newUser);
    setCurrentScreen("home");
    setActiveTab("home");
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
    setConfirmPassword("");
  };

  const handleLogout = async () => {
    setLoggedInUser(null);
    setCurrentScreen("login");
    setActiveTab("home");
    await AsyncStorage.removeItem("@logged_in_user");
  };

  // ----------------------
  // 5. Profile Image Upload
  // ----------------------
  const pickProfileImage = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.5 }, (response) => {
      // Provide a type for `response` if TS complains, e.g. `(response: ImagePickerResponse) => { ... }`
      if (response.didCancel) {
        return; // user canceled
      }
      if (response.errorMessage) {
        Alert.alert("Error picking image", response.errorMessage);
        return;
      }
      const asset = response.assets && response.assets[0];
      if (asset?.uri && loggedInUser) {
        const updated = { ...loggedInUser, photoUrl: asset.uri };
        setLoggedInUser(updated);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      }
    });
  };

  // ----------------------
  // 6. Ministries
  // ----------------------
  const handleCreateMinistry = () => {
    if (!ministryTitle.trim()) {
      Alert.alert("Error", "Ministry must have a title");
      return;
    }
    if (!loggedInUser) {
      Alert.alert("Error", "Must be logged in to create a ministry");
      return;
    }
    const newMinistry: Ministry = {
      id: Date.now().toString(),
      title: ministryTitle.trim(),
      description: ministryDescription.trim(),
      createdBy: loggedInUser.id,
      people: selectedPeople,
    };
    setMinistries([...ministries, newMinistry]);
    setMinistryTitle("");
    setMinistryDescription("");
    setSelectedPeople([]);
    setShowMinistryModal(false);
  };

  // ----------------------
  // 7. Events
  // ----------------------
  const handleCreateEvent = () => {
    if (!eventTitle.trim() || !eventDate || !eventTime) {
      Alert.alert("Error", "Please enter event title, date, and time.");
      return;
    }
    if (!loggedInUser) {
      Alert.alert("Error", "Must be logged in to create an event");
      return;
    }
    const newEvent: EventItem = {
      id: Date.now().toString(),
      title: eventTitle.trim(),
      date: eventDate.trim(),
      time: eventTime.trim(),
      description: eventDescription.trim(),
      createdBy: loggedInUser.id,
      assignedToMinistry: assignedMinistry || undefined,
      attendees: eventAttendees,
    };
    setEvents([...events, newEvent]);
    setEventTitle("");
    setEventDate("");
    setEventTime("");
    setEventDescription("");
    setAssignedMinistry(null);
    setEventAttendees([]);
    setShowEventModal(false);
  };

  // ----------------------
  // 8. YouTube or Home Data
  // ----------------------
  const fetchLatestVideo = async () => {
    try {
      setLoadingVideo(true);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=YOUR_YOUTUBE_API_KEY&channelId=UCzohr1VLqaLFKoZCdKsHvoQ&part=snippet,id&order=date&maxResults=1`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        setLatestVideoId(data.items[0].id.videoId);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch the latest video.");
    } finally {
      setLoadingVideo(false);
    }
  };

  // ----------------------
  // 9. Renderers
  // ----------------------

  // 9.1. Reusable video card
  const renderVideoCard = () => (
    <View style={styles.videoCard}>
      <View style={styles.videoTop}>
        {loadingVideo ? (
          <ActivityIndicator size="large" color="#2D6A4F" />
        ) : latestVideoId ? (
          <YoutubeIframe height={200} videoId={latestVideoId} />
        ) : (
          <Text style={styles.text}>No video available.</Text>
        )}
      </View>
      <View style={styles.videoBottom}>
        <View>
          <Text style={styles.liveBadge}>LIVE</Text>
          <Text style={styles.liveText}>Started at 9:00 AM</Text>
        </View>
        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // 9.2. HOME
  const renderHomeScreen = () => {
    const combinedEvents = events.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    return (
      <FlatList
        key="home"
        ListHeaderComponent={
          <>
            {renderVideoCard()}
            <View style={styles.iconRow}>
              <TouchableOpacity style={styles.iconContainer} onPress={() => setActiveTab("watch")}>
                <Ionicons name="tv-outline" size={24} color="#2D6A4F" />
                <Text style={styles.iconText}>Watch</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconContainer}>
                <Ionicons name="book-outline" size={24} color="#2D6A4F" />
                <Text style={styles.iconText}>Bible</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconContainer}>
                <Ionicons name="location-outline" size={24} color="#2D6A4F" />
                <Text style={styles.iconText}>Location</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>All Events</Text>
          </>
        }
        data={combinedEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          let creatorName = "Unknown";
          const userCreator = users.find((u) => u.id === item.createdBy);
          if (userCreator) {
            creatorName = userCreator.name;
          } else {
            const minCreator = ministries.find((m) => m.id === item.createdBy);
            if (minCreator) {
              creatorName = minCreator.title;
            }
          }

          return (
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDate}>
                {item.date} @ {item.time}
              </Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
              <Text style={styles.cardSubText}>Created by: {creatorName}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.text}>No upcoming events.</Text>}
        contentContainerStyle={styles.homeScreenScroll}
      />
    );
  };

  // 9.3. WATCH
  const renderWatchScreen = () => (
    <FlatList
      key="watch"
      ListHeaderComponent={
        <>
          <Text style={styles.watchHeader}>Watch</Text>
          {renderVideoCard()}
          <View style={styles.placeholderGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={styles.placeholderCard}>
                <Text style={styles.placeholderText}>Placeholder {index + 1}</Text>
              </View>
            ))}
          </View>
        </>
      }
      data={[]}
      renderItem={null}
      ListEmptyComponent={null}
      contentContainerStyle={[styles.homeScreenScroll, { alignItems: "center" }]}
    />
  );

  // 9.4. APPS
  // FIX: define toggleView so TS doesn't complain
  const toggleView = () => {
    setIsGridView((prev) => !prev);
  };

  const renderAppsScreen = () => {
    if (appsSubScreen === "ministry") return renderMinistryPage();
    if (appsSubScreen === "events") return renderEventsPage();

    // Otherwise show “main” Apps screen
    return (
      <FlatList
        key={isGridView ? "apps-grid" : "apps-list"}
        ListHeaderComponent={
          <>
            <Text style={styles.watchHeader}>Apps</Text>
            <TouchableOpacity onPress={toggleView} style={styles.toggleViewButton}>
              <Text style={styles.toggleViewButtonText}>
                {isGridView ? "Switch to List View" : "Switch to Grid View"}
              </Text>
            </TouchableOpacity>
          </>
        }
        data={[
          { label: "Ministries", icon: "people-outline", onPress: () => setAppsSubScreen("ministry") },
          { label: "Events", icon: "calendar-outline", onPress: () => setAppsSubScreen("events") },
          { label: "Bible", icon: "book-outline", onPress: () => {} },
          { label: "Music", icon: "musical-notes-outline", onPress: () => {} },
          { label: "Preaching", icon: "megaphone-outline", onPress: () => {} },
          { label: "Donation", icon: "wallet-outline", onPress: () => {} },
          { label: "Chat", icon: "chatbubble-ellipses-outline", onPress: () => {} },
          { label: "Life Groups", icon: "leaf-outline", onPress: () => {} },
        ]}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          // FIX: referencing styles.addButton requires addButton in StyleSheet
          <TouchableOpacity style={[styles.appButton, styles.addButton]} onPress={item.onPress}>
            <Ionicons name={item.icon} size={24} color="#2D6A4F" style={{ marginRight: 8 }} />
            <Text style={styles.appButtnText}>{item.label}</Text></TouchableOpacity>
        )}
        numColumns={isGridView ? 2 : 1}
        columnWrapperStyle={isGridView ? { justifyContent: "space-between" } : undefined}
        contentContainerStyle={[styles.homeScreenScroll, { alignItems: isGridView ? "center" : "flex-start" }]}
      />
    );
  };

  // 9.5. MINISTRY PAGE
  const renderMinistryPage = () => {
    const sortedMinistries = [...ministries].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.mainTitle}>Ministries</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#FF6B6B" }]}
            onPress={() => setAppsSubScreen("main")}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.appButton, { alignSelf: "center" }]}
          onPress={() => setShowMinistryModal(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#2D6A4F" style={{ marginRight: 8 }} />
          <Text style={styles.appButtonText}>Create Ministry</Text>
        </TouchableOpacity>

        <FlatList
          data={sortedMinistries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            let creatorName = "Unknown";
            const userCreator = users.find((u) => u.id === item.createdBy);
            if (userCreator) {
              creatorName = userCreator.name;
            }
            return (
              <View style={styles.largeCard}>
                <Text style={styles.cardText}>{item.title}</Text>
                <Text style={styles.cardSubText}>{item.description}</Text>
                <Text style={styles.cardSubText}>Created by: {creatorName}</Text>
                {item.people.length > 0 && (
                  <Text style={styles.cardSubText}>
                    People:{" "}
                    {item.people
                      .map((pid) => users.find((u) => u.id === pid)?.name || "Unknown")
                      .join(", ")}
                  </Text>
                )}
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.text}>No ministries yet.</Text>}
          contentContainerStyle={styles.homeScreenScroll}
        />

        {/* Ministry Modal */}
        <Modal visible={showMinistryModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create Ministry</Text>
              <ScrollView style={{ maxHeight: 400 }}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Title"
                  value={ministryTitle}
                  onChangeText={setMinistryTitle}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Description"
                  value={ministryDescription}
                  onChangeText={setMinistryDescription}
                />

                <Text style={styles.cardText}>Add People (select existing users):</Text>
                {users.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}
                    onPress={() => {
                      if (selectedPeople.includes(user.id)) {
                        setSelectedPeople((prev) => prev.filter((p) => p !== user.id));
                      } else {
                        setSelectedPeople((prev) => [...prev, user.id]);
                      }
                    }}
                  >
                    <Ionicons
                      name={selectedPeople.includes(user.id) ? "checkbox" : "square-outline"}
                      size={24}
                      color="#2D6A4F"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.cardSubText}>{user.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowMinistryModal(false);
                    setMinistryTitle("");
                    setMinistryDescription("");
                    setSelectedPeople([]);
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveButton} onPress={handleCreateMinistry}>
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  // 9.6. EVENTS PAGE
  const renderEventsPage = () => {
    const sortedEvents = [...events].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.mainTitle}>Events</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#FF6B6B" }]}
            onPress={() => setAppsSubScreen("main")}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.appButton, { alignSelf: "center" }]}
          onPress={() => setShowEventModal(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#2D6A4F" style={{ marginRight: 8 }} />
          <Text style={styles.appButtonText}>Create Event</Text>
        </TouchableOpacity>

        <FlatList
          data={sortedEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            let creatorName = "Unknown";
            let creatorIsUser = true;
            const userCreator = users.find((u) => u.id === item.createdBy);
            if (userCreator) {
              creatorName = userCreator.name;
            } else {
              const minCreator = ministries.find((m) => m.id === item.createdBy);
              if (minCreator) {
                creatorName = minCreator.title;
                creatorIsUser = false;
              }
            }

            const assignedMin = item.assignedToMinistry
              ? ministries.find((m) => m.id === item.assignedToMinistry)
              : null;

            return (
              <View style={styles.largeCard}>
                <Text style={styles.cardText}>{item.title}</Text>
                <Text style={styles.cardSubText}>
                  {item.date} @ {item.time}
                </Text>
                <Text style={styles.cardSubText}>{item.description}</Text>
                <Text style={styles.cardSubText}>
                  Created by: {creatorName} ({creatorIsUser ? "User" : "Ministry"})
                </Text>
                {assignedMin && (
                  <Text style={styles.cardSubText}>Assigned to Ministry: {assignedMin.title}</Text>
                )}
                {item.attendees.length > 0 && (
                  <Text style={styles.cardSubText}>
                    Attendees:{" "}
                    {item.attendees
                      .map((uid) => users.find((u) => u.id === uid)?.name || "Unknown")
                      .join(", ")}
                  </Text>
                )}
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.text}>No events yet.</Text>}
          contentContainerStyle={styles.homeScreenScroll}
        />

        {/* Event Modal */}
        <Modal visible={showEventModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create Event</Text>
              <ScrollView style={{ maxHeight: 400 }}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Event Title"
                  value={eventTitle}
                  onChangeText={setEventTitle}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Event Date (YYYY-MM-DD)"
                  value={eventDate}
                  onChangeText={setEventDate}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Time (e.g. 10:00 AM)"
                  value={eventTime}
                  onChangeText={setEventTime}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Description"
                  value={eventDescription}
                  onChangeText={setEventDescription}
                />
                <Text style={styles.cardText}>Assign to Ministry (optional):</Text>
                <ScrollView style={{ maxHeight: 100 }}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}
                    onPress={() => setAssignedMinistry(null)}
                  >
                    <Ionicons
                      name={!assignedMinistry ? "radio-button-on" : "radio-button-off"}
                      size={24}
                      color="#2D6A4F"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.cardSubText}>None</Text>
                  </TouchableOpacity>

                  {ministries.map((min) => (
                    <TouchableOpacity
                      key={min.id}
                      style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}
                      onPress={() => setAssignedMinistry(min.id)}
                    >
                      <Ionicons
                        name={assignedMinistry === min.id ? "radio-button-on" : "radio-button-off"}
                        size={24}
                        color="#2D6A4F"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.cardSubText}>{min.title}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.cardText}>Add Attendees (select existing users):</Text>
                {users.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={{ flexDirection: "row", alignItems: "center", marginVertical: 4 }}
                    onPress={() => {
                      if (eventAttendees.includes(user.id)) {
                        setEventAttendees((prev) => prev.filter((p) => p !== user.id));
                      } else {
                        setEventAttendees((prev) => [...prev, user.id]);
                      }
                    }}
                  >
                    <Ionicons
                      name={eventAttendees.includes(user.id) ? "checkbox" : "square-outline"}
                      size={24}
                      color="#2D6A4F"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.cardSubText}>{user.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowEventModal(false);
                    setEventTitle("");
                    setEventDescription("");
                    setEventDate("");
                    setEventTime("");
                    setAssignedMinistry(null);
                    setEventAttendees([]);
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveButton} onPress={handleCreateEvent}>
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  // 9.7. PROFILE
  const renderProfileScreen = () => {
    if (!loggedInUser) {
      return (
        <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={styles.text}>Not logged in</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.homeScreenScroll}>
        <Text style={styles.profileHeader}>Profile</Text>
        <View style={styles.profileTopSection}>
          {loggedInUser.photoUrl ? (
            <Image source={{ uri: loggedInUser.photoUrl }} style={styles.profileImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={80} color="#2D6A4F" />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{loggedInUser.name}</Text>
            <Text style={styles.profileBio}>Email: {loggedInUser.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.profileIconButton} onPress={pickProfileImage}>
          <Ionicons name="camera-outline" size={24} color="#2D6A4F" />
          <Text style={{ marginLeft: 8, color: "#2D6A4F" }}>Upload Profile Image</Text>
        </TouchableOpacity>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.profileSectionHeader}>My Ministries</Text>
          </View>
          {ministries.filter((m) => m.createdBy === loggedInUser.id).length === 0 ? (
            <Text style={styles.text}>You haven’t created any ministries yet.</Text>
          ) : (
            ministries
              .filter((m) => m.createdBy === loggedInUser.id)
              .map((m) => (
                <View key={m.id} style={styles.largeCard}>
                  <Text style={styles.cardText}>{m.title}</Text>
                  <Text style={styles.cardSubText}>{m.description}</Text>
                  {m.people.length > 0 && (
                    <Text style={styles.cardSubText}>
                      People:{" "}
                      {m.people
                        .map((pid) => users.find((u) => u.id === pid)?.name || "Unknown")
                        .join(", ")}
                    </Text>
                  )}
                </View>
              ))
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.profileSectionHeader}>My Events</Text>
          {events.filter((ev) => ev.createdBy === loggedInUser.id).length === 0 ? (
            <Text style={styles.text}>You haven’t created any events yet.</Text>
          ) : (
            events
              .filter((ev) => ev.createdBy === loggedInUser.id)
              .map((ev) => (
                <View key={ev.id} style={styles.largeCard}>
                  <Text style={styles.cardText}>{ev.title}</Text>
                  <Text style={styles.cardSubText}>
                    {ev.date} @ {ev.time}
                  </Text>
                  <Text style={styles.cardSubText}>{ev.description}</Text>
                  {ev.attendees.length > 0 && (
                    <Text style={styles.cardSubText}>
                      Attendees:{" "}
                      {ev.attendees
                        .map((uid) => users.find((u) => u.id === uid)?.name || "Unknown")
                        .join(", ")}
                    </Text>
                  )}
                </View>
              ))
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // 9.8. AUTH SCREEN
  const renderAuthScreen = () => {
    return (
      <View style={styles.authScreen}>
        <Image
          source={{ uri: "https://example.com/praying-hands.jpg" }}
          style={styles.authBackground}
        />
        <View style={styles.authCard}>
          <View style={styles.authToggleContainer}>
            <TouchableOpacity
              style={currentAuthScreen === "login" ? styles.authToggleActive : styles.authToggleInactive}
              onPress={() => setCurrentAuthScreen("login")}
            >
              <Text
                style={
                  currentAuthScreen === "login"
                    ? styles.authToggleTextActive
                    : styles.authToggleTextInactive
                }
              >
                Log In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={currentAuthScreen === "signup" ? styles.authToggleActive : styles.authToggleInactive}
              onPress={() => setCurrentAuthScreen("signup")}
            >
              <Text
                style={
                  currentAuthScreen === "signup"
                    ? styles.authToggleTextActive
                    : styles.authToggleTextInactive
                }
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {currentAuthScreen === "login" ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email or Username"
                placeholderTextColor="#A8A8A8"
                value={authEmail}
                onChangeText={setAuthEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#A8A8A8"
                value={authPassword}
                onChangeText={setAuthPassword}
              />
              <TouchableOpacity style={styles.authButton} onPress={handleLogin}>
                <Text style={styles.authButtonText}>Log In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                placeholderTextColor="#A8A8A8"
                value={authName}
                onChangeText={setAuthName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email or Username"
                placeholderTextColor="#A8A8A8"
                value={authEmail}
                onChangeText={setAuthEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#A8A8A8"
                value={authPassword}
                onChangeText={setAuthPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry
                placeholderTextColor="#A8A8A8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity style={styles.authButton} onPress={handleSignup}>
                <Text style={styles.authButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.orText}>OR</Text>
          <View style={styles.socialIconsContainer}>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-google" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-facebook" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-twitter" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // -------------------------
  // 10. Final Return
  // -------------------------
  const renderContent = () => {
    switch (currentScreen) {
      case "login":
      case "signup":
        return renderAuthScreen();
      case "home":
        return renderHomeScreen();
      case "watch":
        return renderWatchScreen();
      case "apps":
        return renderAppsScreen();
      case "profile":
        return renderProfileScreen();
      default:
        return renderAuthScreen();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.appContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {currentScreen === "login" || currentScreen === "signup" ? (
        renderAuthScreen()
      ) : (
        <SafeAreaView style={styles.homeScreenContainer}>
          {renderContent()}
          {/* BOTTOM NAV */}
          <View style={styles.bottomNav}>
            {/* Home */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                setCurrentScreen("home");
                setActiveTab("home");
                setAppsSubScreen("main");
              }}
            >
              <View style={[styles.navIconContainer, activeTab === "home" && styles.navIconActive]}>
                <Ionicons
                  name="home-outline"
                  size={24}
                  color={activeTab === "home" ? "#FFFFFF" : "#2D6A4F"}
                />
              </View>
              <Text style={[styles.navText, activeTab === "home" && styles.navTextActive]}>Home</Text>
            </TouchableOpacity>

            {/* Watch */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                setCurrentScreen("watch");
                setActiveTab("watch");
                setAppsSubScreen("main");
              }}
            >
              <View style={[styles.navIconContainer, activeTab === "watch" && styles.navIconActive]}>
                <Ionicons
                  name="tv-outline"
                  size={24}
                  color={activeTab === "watch" ? "#FFFFFF" : "#2D6A4F"}
                />
              </View>
              <Text style={[styles.navText, activeTab === "watch" && styles.navTextActive]}>Watch</Text>
            </TouchableOpacity>

            {/* Apps */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                setCurrentScreen("apps");
                setActiveTab("apps");
              }}
            >
              <View style={[styles.navIconContainer, activeTab === "apps" && styles.navIconActive]}>
                <Ionicons
                  name="grid-outline"
                  size={24}
                  color={activeTab === "apps" ? "#FFFFFF" : "#2D6A4F"}
                />
              </View>
              <Text style={[styles.navText, activeTab === "apps" && styles.navTextActive]}>Apps</Text>
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => {
                setCurrentScreen("profile");
                setActiveTab("profile");
                setAppsSubScreen("main");
              }}
            >
              <View style={[styles.navIconContainer, activeTab === "profile" && styles.navIconActive]}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={activeTab === "profile" ? "#FFFFFF" : "#2D6A4F"}
                />
              </View>
              <Text style={[styles.navText, activeTab === "profile" && styles.navTextActive]}>Profile</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </KeyboardAvoidingView>
  );
};

// -------------------------
// 11. Styles
// -------------------------
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "#D8F3DC",
  },
  authScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  authBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    elevation: 10,
    alignItems: "center",
  },
  authToggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
    width: "100%",
  },
  authToggleActive: {
    flex: 1,
    backgroundColor: "#2D6A4F",
    paddingVertical: 10,
    alignItems: "center",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  authToggleInactive: {
    flex: 1,
    backgroundColor: "#D8F3DC",
    paddingVertical: 10,
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  authToggleTextActive: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  authToggleTextInactive: {
    color: "#2D6A4F",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#F8F8F8",
  },
  authButton: {
    backgroundColor: "#B7E4C7",
    borderRadius: 10,
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  authButtonText: {
    color: "#2D6A4F",
    fontSize: 18,
    fontWeight: "bold",
  },
  orText: {
    fontSize: 16,
    color: "#A8A8A8",
    marginBottom: 20,
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
  },
  socialIcon: {
    backgroundColor: "#2D6A4F",
    borderRadius: 50,
    padding: 15,
    alignItems: "center",
  },
  homeScreenContainer: {
    flex: 1,
    backgroundColor: "#D8F3DC",
  },
  homeScreenScroll: {
    padding: 16,
    paddingBottom: 100,
  },
  videoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  videoTop: {
    backgroundColor: "#F9FBE7",
    padding: 16,
    alignItems: "center",
  },
  videoBottom: {
    backgroundColor: "#B7E4C7",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  liveBadge: {
    color: "red",
    fontWeight: "bold",
  },
  liveText: {
    color: "#2D6A4F",
  },
  playButton: {
    backgroundColor: "#2D6A4F",
    padding: 8,
    borderRadius: 20,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  iconContainer: {
    alignItems: "center",
    flex: 1,
  },
  iconText: {
    marginTop: 4,
    color: "#2D6A4F",
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 10,
    marginTop: 10,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 14,
    color: "#6B705C",
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: "#2D6A4F",
  },
  watchHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 16,
    textAlign: "center",
  },
  placeholderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  placeholderCard: {
    backgroundColor: "#F9FBE7",
    width: "48%",
    aspectRatio: 1.6,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#2D6A4F",
    fontSize: 16,
    fontWeight: "500",
  },
  text: {
    color: "#2D6A4F",
    fontSize: 16,
    textAlign: "center",
  },
  toggleViewButton: {
    backgroundColor: "#2D6A4F",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
    alignSelf: "center",
  },
  toggleViewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Important: We must define this style because we reference it in the Apps and Ministry/Events pages
  addButton: {
    backgroundColor: "#2D6A4F",
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginLeft: 8, // optional margin
    marginVertical: 8,
  },
  appButton: {
    backgroundColor: "#B7E4C7",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    marginHorizontal: 6,
  },
  appButtonText: {
    color: "#2D6A4F",
    fontSize: 16,
    fontWeight: "500",
  },
  // Ministry & Events
  container: {
    flex: 1,
    backgroundColor: "#D8F3DC",
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D6A4F",
    margin: 16,
  },
  largeCard: {
    backgroundColor: "#F9FBE7",
    borderRadius: 20,
    padding: 16,
    margin: 16,
  },
  cardText: {
    fontSize: 16,
    color: "#2D6A4F",
    fontWeight: "600",
  },
  cardSubText: {
    fontSize: 14,
    color: "#6B705C",
  },
  // Profile
  profileHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 16,
    textAlign: "center",
  },
  profileTopSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: "#2D6A4F",
  },
  profileIconButton: {
    flexDirection: "row",
    backgroundColor: "#B7E4C7",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    marginLeft: 16,
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  profileSectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  // Bottom Nav
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#D8F3DC",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E4E4E4",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navItem: {
    alignItems: "center",
  },
  navIconContainer: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
    marginBottom: 4,
  },
  navIconActive: {
    backgroundColor: "#B7E4C7",
  },
  navText: {
    color: "#2D6A4F",
    fontSize: 14,
    fontWeight: "500",
  },
  navTextActive: {
    fontWeight: "bold",
  },
  // Modals
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: "#000",
    marginBottom: 15,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalSaveButton: {
    backgroundColor: "#2D6A4F",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default App;
