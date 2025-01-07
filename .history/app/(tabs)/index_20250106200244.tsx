// App.tsx (or index.tsx)
// Hypothetical single-file ~1050 lines code
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
} from "react-native";
import YoutubeIframe from "react-native-youtube-iframe";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --------------------
// 1. Type Definitions
// --------------------
interface User {
  name: string;
  email: string;
  password: string;
}

interface Ministry {
  id: string;
  title: string;
  description: string;
}

interface EventData {
  id: string;
  title: string;
  date: string;
  description: string;
}

// If you have multiple screens, your code might be bigger, 
// but here we do it all in one place.

// --------------------
// 2. Main Component
// --------------------
const App: React.FC = (): React.ReactNode => {
  // 2.1. Auth states
  const [currentScreen, setCurrentScreen] = useState<"login" | "signup" | "home">("login");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");

  // 2.2. For bottom nav
  const [activeTab, setActiveTab] = useState<"home" | "watch" | "apps" | "profile">("home");

  // 2.3. YouTube & data
  const [latestVideoId, setLatestVideoId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 2.4. Profile data
  const [userProfile, setUserProfile] = useState<{
    name: string;
    bio: string;
    photoUrl: string;
  } | null>(null);

  // -----------------------------
  // 2.5. KEY PART: Ministries & Events
  // -----------------------------
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);

  // For controlling modals or forms
  const [showAddMinistryModal, setShowAddMinistryModal] = useState(false);
  const [newMinistryTitle, setNewMinistryTitle] = useState("");
  const [newMinistryDesc, setNewMinistryDesc] = useState("");

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  // 2.6. For Apps layout
  const [isGridView, setIsGridView] = useState<boolean>(true);

  // Example YouTube Key
  const YOUTUBE_API_KEY = "YOUR_YOUTUBE_API_KEY";

  // ----------------------------------------------------------------
  // 3. useEffect: Load from AsyncStorage on startup
  // ----------------------------------------------------------------
  useEffect(() => {
    const checkUserCredentials = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("@user_credentials");
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setCurrentScreen("home");
          setUserProfile({
            name: parsedUser.name || "Unknown User",
            bio: "Passionate about community service and outreach.",
            photoUrl: "https://example.com/user-photo.jpg",
          });
        }
      } catch (error) {
        console.error("Error loading stored credentials:", error);
      }
    };

    checkUserCredentials();

    // Also load ministries & events from storage
    loadDataFromStorage();
  }, []);

  // When the app first starts, fetch YouTube data and any other data
  useEffect(() => {
    fetchLatestVideo();
    // We might also fetch from some backend or load more data
  }, []);

  // ----------------------------------------------------------------
  // 3.1. Save Ministries & Events to AsyncStorage whenever they change
  // ----------------------------------------------------------------
  useEffect(() => {
    saveDataToStorage();
  }, [ministries, events]); // Every time ministries/events changes, we save

  const loadDataFromStorage = async () => {
    try {
      const savedMinistries = await AsyncStorage.getItem("@ministries_list");
      const savedEvents = await AsyncStorage.getItem("@events_list");
      if (savedMinistries) {
        setMinistries(JSON.parse(savedMinistries));
      }
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } catch (error) {
      console.log("Error loading ministries/events from storage:", error);
    }
  };

  const saveDataToStorage = async () => {
    try {
      await AsyncStorage.setItem("@ministries_list", JSON.stringify(ministries));
      await AsyncStorage.setItem("@events_list", JSON.stringify(events));
    } catch (error) {
      console.log("Error saving ministries/events to storage:", error);
    }
  };

  // ----------------------------------------------------------------
  // 4. Functions to ADD Ministries & Events
  // ----------------------------------------------------------------
  const addMinistry = () => {
    if (!newMinistryTitle.trim()) {
      Alert.alert("Error", "Please enter a ministry title.");
      return;
    }
    const newMinistry: Ministry = {
      id: Date.now().toString(),
      title: newMinistryTitle,
      description: newMinistryDesc,
    };
    setMinistries([...ministries, newMinistry]);
    setNewMinistryTitle("");
    setNewMinistryDesc("");
    setShowAddMinistryModal(false);
  };

  const addEvent = () => {
    if (!newEventTitle.trim()) {
      Alert.alert("Error", "Please enter an event title.");
      return;
    }
    const newEvent: EventData = {
      id: Date.now().toString(),
      title: newEventTitle,
      description: newEventDesc,
      date: newEventDate,
    };
    setEvents([...events, newEvent]);
    setNewEventTitle("");
    setNewEventDesc("");
    setNewEventDate("");
    setShowAddEventModal(false);
  };

  // ----------------------------------------------------------------
  // 5. Fetch YouTube data (example)
  // ----------------------------------------------------------------
  const fetchLatestVideo = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=UCzohr1VLqaLFKoZCdKsHvoQ&part=snippet,id&order=date&maxResults=1`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        setLatestVideoId(data.items[0].id.videoId);
      }
    } catch (error) {
      console.error("Failed to fetch latest video:", error);
      Alert.alert("Error", "Failed to fetch the latest video.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // 6. Auth Handlers (login/signup)
  // ----------------------------------------------------------------
  const handleLogin = async () => {
    if (email.trim().length < 3 || password.trim().length < 3) {
      Alert.alert(
        "Error",
        "Invalid credentials. Please enter a valid email/username and password (at least 3 characters)."
      );
      return;
    }

    try {
      const storedUserStr = await AsyncStorage.getItem("@user_credentials");
      if (!storedUserStr) {
        Alert.alert("Error", "No account found. Please sign up first.");
        return;
      }

      const storedUser: User = JSON.parse(storedUserStr);
      if (storedUser.email === email && storedUser.password === password) {
        setCurrentScreen("home");
        setUserProfile({
          name: storedUser.name,
          bio: "Passionate about community service and outreach.",
          photoUrl: "https://example.com/user-photo.jpg",
        });
      } else {
        Alert.alert("Error", "Incorrect email or password.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to log in.");
    }
  };

  const handleSignup = async () => {
    if (name.trim().length < 2) {
      Alert.alert("Error", "Please enter your full name (at least 2 characters).");
      return;
    }
    if (email.trim().length < 3 || password.trim().length < 3) {
      Alert.alert(
        "Error",
        "Please enter a valid email/username and password (at least 3 characters)."
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const userObject: User = {
        name,
        email,
        password,
      };
      await AsyncStorage.setItem("@user_credentials", JSON.stringify(userObject));

      setUserProfile({
        name,
        bio: "Passionate about community service and outreach.",
        photoUrl: "https://example.com/user-photo.jpg",
      });

      setCurrentScreen("home");
    } catch (error) {
      Alert.alert("Error", "Failed to save user credentials after signup.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("@user_credentials");
      setCurrentScreen("login");
      setActiveTab("home");
      setUserProfile(null);
      setEmail("");
      setName("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      Alert.alert("Error", "Failed to log out.");
    }
  };

  const toggleView = () => {
    setIsGridView((prev) => !prev);
  };

  // ----------------------------------------------------------------
  // 7. RENDER Screens: Home, Watch, Apps, Profile
  // ----------------------------------------------------------------
  
  // 7.1. Reusable “Video Card”
  const renderVideoCard = () => (
    <View style={styles.videoCard}>
      <View style={styles.videoTop}>
        {loading ? (
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

  // 7.2. Home
  const renderHomeContent = () => (
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
          <Text style={styles.sectionHeader}>Events</Text>
        </>
      }
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDate}>{item.date}</Text>
          <Text style={styles.eventDescription}>{item.description}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.text}>No upcoming events.</Text>}
      contentContainerStyle={styles.homeScreenScroll}
    />
  );

  // 7.3. Watch
  const renderWatchContent = () => (
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

  // 7.4. Apps
  const renderAppsContent = () => {
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
            {/* Example: Let the user create a new Ministry or Event from Apps */}
            <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginVertical: 10 }}>
              <TouchableOpacity
                style={styles.appButton}
                onPress={() => setShowAddMinistryModal(true)}
              >
                <Ionicons name="rose-outline" size={24} color="#2D6A4F" style={{ marginRight: 8 }} />
                <Text style={styles.appButtonText}>Add Ministry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.appButton}
                onPress={() => setShowAddEventModal(true)}
              >
                <Ionicons name="calendar-outline" size={24} color="#2D6A4F" style={{ marginRight: 8 }} />
                <Text style={styles.appButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        data={[]} // We’re not listing anything else here
        renderItem={null}
        ListEmptyComponent={<View />}
        contentContainerStyle={[
          styles.homeScreenScroll,
          { alignItems: isGridView ? "center" : "flex-start" },
        ]}
      />
    );
  };

  // 7.5. Profile
  const renderProfileContent = () => (
    <FlatList
      key="profile"
      ListHeaderComponent={
        <>
          <Text style={styles.profileHeader}>Profile</Text>
          <View style={styles.profileTopSection}>
            {userProfile?.photoUrl ? (
              <Image source={{ uri: userProfile.photoUrl }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={80} color="#2D6A4F" />
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile?.name || "User Name"}</Text>
              <Text style={styles.profileBio}>
                {userProfile?.bio || "This is the space for the user bio."}
              </Text>
            </View>
          </View>

          <View style={styles.profileIconsRow}>
            <TouchableOpacity style={styles.profileIconButton}>
              <Ionicons name="settings-outline" size={24} color="#2D6A4F" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileIconButton}>
              <Ionicons name="information-circle-outline" size={24} color="#2D6A4F" />
            </TouchableOpacity>
          </View>

          {/* Show Ministries user created */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.profileSectionHeader}>My Ministries</Text>
            </View>
            {ministries.length === 0 ? (
              <Text style={styles.text}>No ministries yet.</Text>
            ) : (
              ministries.map((min) => (
                <View key={min.id} style={styles.largeCard}>
                  <Text style={styles.cardText}>{min.title}</Text>
                  <Text style={styles.cardSubText}>{min.description}</Text>
                </View>
              ))
            )}
          </View>

          {/* Show Events user created */}
          <View style={styles.sectionContainer}>
            <Text style={styles.profileSectionHeader}>My Events</Text>
            {events.length === 0 ? (
              <Text style={styles.text}>No events yet.</Text>
            ) : (
              events.map((evt) => (
                <View key={evt.id} style={styles.largeCard}>
                  <Text style={styles.cardText}>{evt.title}</Text>
                  <Text style={styles.cardSubText}>{evt.date}</Text>
                  <Text style={styles.cardSubText}>{evt.description}</Text>
                </View>
              ))
            )}
          </View>
        </>
      }
      data={[]}
      renderItem={null}
      ListEmptyComponent={null}
      contentContainerStyle={styles.homeScreenScroll}
      ListFooterComponent={
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      }
    />
  );

  // 7.6. Switch among tabs
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return renderHomeContent();
      case "watch":
        return renderWatchContent();
      case "apps":
        return renderAppsContent();
      case "profile":
        return renderProfileContent();
      default:
        return null;
    }
  };

  // ----------------------------------------------------------------
  // 8. Return & JSX
  // ----------------------------------------------------------------
  return (
    <KeyboardAvoidingView style={styles.appContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {currentScreen === "login" || currentScreen === "signup" ? (
        // --------------------
        // AUTH SCREEN
        // --------------------
        <View style={styles.authScreen}>
          <Image source={{ uri: "https://example.com/praying-hands.jpg" }} style={styles.authBackground} />
          <View style={styles.authCard}>
            <View style={styles.authToggleContainer}>
              <TouchableOpacity
                style={currentScreen === "login" ? styles.authToggleActive : styles.authToggleInactive}
                onPress={() => setCurrentScreen("login")}
              >
                <Text
                  style={
                    currentScreen === "login"
                      ? styles.authToggleTextActive
                      : styles.authToggleTextInactive
                  }
                >
                  Log In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={currentScreen === "signup" ? styles.authToggleActive : styles.authToggleInactive}
                onPress={() => setCurrentScreen("signup")}
              >
                <Text
                  style={
                    currentScreen === "signup"
                      ? styles.authToggleTextActive
                      : styles.authToggleTextInactive
                  }
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {currentScreen === "login" ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Enter email or username"
                  placeholderTextColor="#A8A8A8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  placeholderTextColor="#A8A8A8"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.authButton} onPress={handleLogin}>
                  <Text style={styles.authButtonText}>Log In</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#A8A8A8"
                  value={name}
                  onChangeText={setName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email or username"
                  placeholderTextColor="#A8A8A8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  placeholderTextColor="#A8A8A8"
                  value={password}
                  onChangeText={setPassword}
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
      ) : (
        // --------------------
        // MAIN APP SCREEN
        // --------------------
        <SafeAreaView style={styles.homeScreenContainer}>
          {renderContent()}

          {/* BOTTOM NAV */}
          <View style={styles.bottomNav}>
            {/* Home */}
            <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("home")}>
              <View style={[styles.navIconContainer, activeTab === "home" && styles.navIconActive]}>
                <Ionicons
                  name="home-outline"
                  size={24}
                  color={activeTab === "home" ? "#FFFFFF" : "#2D6A4F"}
                />
              </View>
              <Text style={[styles.navText, activeTab === "home" && styles.navTextActive]}>
                Home
              </Text>
            </TouchableOpacity>

            {/* Watch */}
            <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("watch")}>
              <View style={[styles.navIconContainer, activeTab === "watch" && styles.navIconActive]}>
                <Ionicons
                  name="tv-outline"
                  size={24}
                  color={activeTab === "watch" ? "#FFFFFF" : "#2D6A4F"}
                />
              </View>
              <Text style={[styles.navText, activeTab === "watch" && styles.navTextActive]}>
                Watch
              </Text>
            </TouchableOpacity>

            {/* Apps */}
            <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("apps")}>
              <View style={[styles.navIconContainer, activeTab === "apps" && styles.navIconActive]}>
                <Ionicons
                  name="grid-outline"
                  size={24}
                  color={activeTab === "apps" ? "#FFFFFF" : "#2D6A4F"}
                />
              </View>
              <Text style={[styles.navText, activeTab === "apps" && styles.navTextActive]}>
                Apps
              </Text>
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab("profile")}>
              <View style={[styles.navIconContainer, activeTab === "profile" && styles.navIconActive]}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={activeTab === "profile" ? "#FFFFFF" : "#2D6A4F"}
                />
              </View>
              <Text style={[styles.navText, activeTab === "profile" && styles.navTextActive]}>
                Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* --------------------
              MODALS
             -------------------- */}
          {/* Add Ministry Modal */}
          <Modal visible={showAddMinistryModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Add Ministry</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ministry Title"
                  value={newMinistryTitle}
                  onChangeText={setNewMinistryTitle}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Description"
                  value={newMinistryDesc}
                  onChangeText={setNewMinistryDesc}
                />
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setShowAddMinistryModal(false);
                      setNewMinistryTitle("");
                      setNewMinistryDesc("");
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSaveButton} onPress={addMinistry}>
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Add Event Modal */}
          <Modal visible={showAddEventModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Add Event</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Event Title"
                  value={newEventTitle}
                  onChangeText={setNewEventTitle}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Event Date"
                  value={newEventDate}
                  onChangeText={setNewEventDate}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Description"
                  value={newEventDesc}
                  onChangeText={setNewEventDesc}
                />
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setShowAddEventModal(false);
                      setNewEventTitle("");
                      setNewEventDesc("");
                      setNewEventDate("");
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSaveButton} onPress={addEvent}>
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      )}
    </KeyboardAvoidingView>
  );
};

// -----------------------------------
// 9. Styles (Trimmed for brevity)
// -----------------------------------
const styles = StyleSheet.create({
  // NOTE: Below are just placeholders for demonstration. 
  // Copy your existing styles plus these for modals, etc.

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
    width: "100%",
    marginBottom: 20,
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
    color: "#FFF",
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
    borderColor: "#E4E4E4",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
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
    width: "60%",
    justifyContent: "space-between",
  },
  socialIcon: {
    backgroundColor: "#2D6A4F",
    borderRadius: 50,
    padding: 15,
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
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  videoTop: {
    backgroundColor: "#F9FBE7",
    padding: 16,
  },
  videoBottom: {
    backgroundColor: "#B7E4C7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  liveBadge: {
    color: "red",
    fontWeight: "bold",
    marginBottom: 4,
  },
  liveText: {
    color: "#2D6A4F",
  },
  playButton: {
    backgroundColor: "#2D6A4F",
    borderRadius: 20,
    padding: 8,
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
    color: "#2D6A4F",
    fontSize: 16,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: "#FFF",
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
  },
  toggleViewButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  appButton: {
    backgroundColor: "#B7E4C7",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  appButtonText: {
    color: "#2D6A4F",
    fontSize: 16,
    fontWeight: "500",
  },
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
  profileIconsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  profileIconButton: {
    backgroundColor: "#B7E4C7",
    borderRadius: 20,
    padding: 10,
    marginRight: 16,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  profileSectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
  },
  largeCard: {
    backgroundColor: "#F9FBE7",
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
  },
  cardText: {
    color: "#2D6A4F",
    fontSize: 16,
    fontWeight: "500",
  },
  cardSubText: {
    color: "#6B705C",
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
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
  // MODAL STYLES
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#FFF",
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
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
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
    color: "#FFF",
    fontSize: 16,
  },
});

export default App;
