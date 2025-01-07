// app/(tabs)/index.tsx

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
import Ionicons from "react-native-vector-icons/Ionicons";
import YoutubeIframe from "react-native-youtube-iframe";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Example interfaces
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  photoUrl?: string;
}

interface Ministry {
  id: string;
  title: string;
  description: string;
  createdBy: string; // userId
  people: string[];  // userIds
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  createdBy: string;         // userId or ministryId
  assignedToMinistry?: string;
  attendees: string[];       // userIds
}

const Index: React.FC = () => {
  // --------------------
  // 1) Example States
  // --------------------
  const [currentScreen, setCurrentScreen] = useState<"login" | "signup" | "home" | "apps" | "watch" | "profile">("login");
  const [activeTab, setActiveTab] = useState<"home" | "watch" | "apps" | "profile">("home");
  
  const [isGridView, setIsGridView] = useState<boolean>(true);

  // Example data arrays
  const [users, setUsers] = useState<User[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  
  // Auth placeholders
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // ... other states ...
  
  // For YouTube example
  const [latestVideoId, setLatestVideoId] = useState("");
  const [loading, setLoading] = useState(false);

  // Example Modals
  const [showMinistryModal, setShowMinistryModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  // --------------------
  // 2) Toggle View Function
  // --------------------
  // Fixes "Cannot find name 'toggleView'." by defining it
  const toggleView = () => {
    setIsGridView((prev) => !prev);
  };

  // --------------------
  // 3) Load & Save Data (AsyncStorage) - Example
  // --------------------
  useEffect(() => {
    // Load data from AsyncStorage, if needed
  }, []);

  useEffect(() => {
    // Save data if arrays change, if needed
  }, [users, ministries, events]);

  // --------------------
  // 4) Handlers, e.g. login, signup, etc.
  // --------------------
  const handleLogin = () => {
    // Example login
    Alert.alert("Logged in successfully (fake)!");
    setCurrentScreen("home");
    setActiveTab("home");
  };

  // --------------------
  // 5) Renderers for each Tab Screen
  // --------------------
  const renderHomeContent = () => (
    <FlatList
      key="home"
      ListHeaderComponent={
        <>
          {/* Possibly a VideoCard or something */}
          <Text style={styles.sectionHeader}>Home Screen</Text>
        </>
      }
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventDate}>
            {item.date} @ {item.time}
          </Text>
          <Text style={styles.eventDescription}>{item.description}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.text}>No events yet.</Text>}
      contentContainerStyle={styles.homeScreenScroll}
    />
  );

  const renderWatchContent = () => (
    <View style={styles.container}>
      <Text style={styles.watchHeader}>Watch Screen</Text>
    </View>
  );

  // For the Apps screen, referencing toggleView
  const renderAppsContent = () => (
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
          {/* Example add button usage */}
          <TouchableOpacity style={styles.addButton} onPress={() => setShowMinistryModal(true)}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={{ color: "#FFF", marginLeft: 8 }}>Add Ministry</Text>
          </TouchableOpacity>
        </>
      }
      data={[]} // e.g. might list your apps
      renderItem={null}
      contentContainerStyle={[styles.homeScreenScroll, { alignItems: "center" }]}
    />
  );

  const renderProfileContent = () => (
    <View style={styles.container}>
      <Text style={styles.profileHeader}>Profile Screen</Text>
      {/* Another example usage of addButton */}
      <TouchableOpacity style={styles.addButton} onPress={() => setShowEventModal(true)}>
        <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
        <Text style={{ color: "#FFF", marginLeft: 8 }}>Create Event</Text>
      </TouchableOpacity>
    </View>
  );

  // 6) Switch among the 4 main tabs
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
        return renderHomeContent();
    }
  };

  // 7) Return main component
  return (
    <KeyboardAvoidingView style={styles.appContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {currentScreen === "login" || currentScreen === "signup" ? (
        // AUTH Screen Example
        <View style={styles.authScreen}>
          <Image source={{ uri: "https://example.com/auth-bg.jpg" }} style={styles.authBackground} />
          <View style={styles.authCard}>
            {/* Example: Login or Signup UI */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A8A8A8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A8A8A8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.authButton} onPress={handleLogin}>
              <Text style={styles.authButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // MAIN SCREEN with bottom nav
        <SafeAreaView style={styles.homeScreenContainer}>
          {renderContent()}

          {/* Example bottom nav */}
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab("home"); setCurrentScreen("home"); }}>
              <View style={[styles.navIconContainer, activeTab === "home" && styles.navIconActive]}>
                <Ionicons name="home-outline" size={24} color={activeTab === "home" ? "#FFFFFF" : "#2D6A4F"} />
              </View>
              <Text style={[styles.navText, activeTab === "home" && styles.navTextActive]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab("watch"); setCurrentScreen("watch"); }}>
              <View style={[styles.navIconContainer, activeTab === "watch" && styles.navIconActive]}>
                <Ionicons name="tv-outline" size={24} color={activeTab === "watch" ? "#FFFFFF" : "#2D6A4F"} />
              </View>
              <Text style={[styles.navText, activeTab === "watch" && styles.navTextActive]}>Watch</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab("apps"); setCurrentScreen("apps"); }}>
              <View style={[styles.navIconContainer, activeTab === "apps" && styles.navIconActive]}>
                <Ionicons name="grid-outline" size={24} color={activeTab === "apps" ? "#FFFFFF" : "#2D6A4F"} />
              </View>
              <Text style={[styles.navText, activeTab === "apps" && styles.navTextActive]}>Apps</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab("profile"); setCurrentScreen("profile"); }}>
              <View style={[styles.navIconContainer, activeTab === "profile" && styles.navIconActive]}>
                <Ionicons name="person-outline" size={24} color={activeTab === "profile" ? "#FFFFFF" : "#2D6A4F"} />
              </View>
              <Text style={[styles.navText, activeTab === "profile" && styles.navTextActive]}>Profile</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* Example: Ministry Modal */}
      <Modal visible={showMinistryModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Ministry</Text>
            {/* Your inputs here */}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowMinistryModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Example: Event Modal */}
      <Modal visible={showEventModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Event</Text>
            {/* Your inputs here */}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowEventModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// ------------------------------
// STYLES: includes addButton
// ------------------------------
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
  input: {
    width: "100%",
    borderColor: "#E4E4E4",
    borderWidth: 1,
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
  homeScreenContainer: {
    flex: 1,
    backgroundColor: "#D8F3DC",
  },
  homeScreenScroll: {
    padding: 16,
    paddingBottom: 100,
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
  container: {
    flex: 1,
    backgroundColor: "#D8F3DC",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 10,
    marginTop: 10,
    textAlign: "center",
  },
  watchHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginTop: 16,
    marginBottom: 16,
    textAlign: "center",
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
  },
  toggleViewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // ---------------------------
  // The missing 'addButton' style
  // ---------------------------
  addButton: {
    backgroundColor: "#2D6A4F",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  profileHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 16,
    textAlign: "center",
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

  // Example modals
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 10,
  },
  modalCancelButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Index;
