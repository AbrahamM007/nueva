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
import * as ImagePicker from "expo-image-picker";

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
  createdBy: string;
  people: string[];
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  createdBy: string;
  assignedToMinistry?: string;
  attendees: string[];
}

interface ServiceItem {
  id: string;
  title: string;
  date: string;
  songs: string[];
  roles: { [role: string]: string[] };
  timeline: string;
  multimedia: string[];
  createdBy: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

type Screen = "login" | "signup" | "home" | "apps" | "watch" | "profile";
type AppsSubScreen =
  | "main"
  | "ministry"
  | "events"
  | "bible"
  | "services"
  | "chatList"
  | "chatConversation";

// -------------------------------
// Styles Definition
// -------------------------------
const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: "#D8F3DC" },
  authScreen: { flex: 1, alignItems: "center", justifyContent: "center" },
  authBackground: { position: "absolute", width: "100%", height: "100%", resizeMode: "cover" },
  authCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, width: "90%", elevation: 10, alignItems: "center" },
  authToggleContainer: { flexDirection: "row", marginBottom: 20, width: "100%" },
  authToggleActive: { flex: 1, backgroundColor: "#2D6A4F", paddingVertical: 10, alignItems: "center", borderTopRightRadius: 10, borderBottomRightRadius: 10 },
  authToggleInactive: { flex: 1, backgroundColor: "#D8F3DC", paddingVertical: 10, alignItems: "center", borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  authToggleTextActive: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  authToggleTextInactive: { color: "#2D6A4F", fontSize: 16, fontWeight: "bold" },
  input: { width: "100%", borderWidth: 1, borderColor: "#E4E4E4", borderRadius: 10, padding: 10, marginBottom: 15, backgroundColor: "#F8F8F8" },
  authButton: { backgroundColor: "#B7E4C7", borderRadius: 10, paddingVertical: 10, width: "100%", alignItems: "center", marginBottom: 20 },
  authButtonText: { color: "#2D6A4F", fontSize: 18, fontWeight: "bold" },
  orText: { fontSize: 16, color: "#A8A8A8", marginBottom: 20 },
  socialIconsContainer: { flexDirection: "row", justifyContent: "space-between", width: "60%" },
  socialIcon: { backgroundColor: "#2D6A4F", borderRadius: 50, padding: 15, alignItems: "center" },
  homeScreenScroll: { padding: 16, paddingBottom: 100 },
  videoCard: { backgroundColor: "#FFFFFF", borderRadius: 20, marginBottom: 16, overflow: "hidden" },
  videoTop: { backgroundColor: "#F9FBE7", padding: 16, alignItems: "center" },
  videoBottom: { backgroundColor: "#B7E4C7", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8, alignItems: "center" },
  liveBadge: { color: "red", fontWeight: "bold" },
  liveText: { color: "#2D6A4F" },
  playButton: { backgroundColor: "#2D6A4F", padding: 8, borderRadius: 20 },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  mainTitle: { fontSize: 24, fontWeight: "bold", color: "#2D6A4F", margin: 16 },
  sectionHeader: { fontSize: 16, fontWeight: "bold", marginVertical: 10, color: "#2D6A4F" },
  uploadButton: { backgroundColor: "#B7E4C7", padding: 10, borderRadius: 10, alignItems: "center", marginVertical: 10 },
  uploadButtonText: { color: "#2D6A4F", fontWeight: "bold" },
  addButton: { backgroundColor: "#2D6A4F", borderRadius: 10, padding: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", margin: 8 },
  appButton: { backgroundColor: "#2D6A4F", borderRadius: 20, padding: 10, margin: 6, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  appButtonText: { color: "#fff", fontSize: 16 },
  toggleViewButton: { backgroundColor: "#2D6A4F", padding: 10, borderRadius: 10, marginVertical: 10 },
  toggleViewButtonText: { color: "#fff", fontWeight: "bold" },
  text: { fontSize: 16, color: "#2D6A4F", textAlign: "center" },
  watchHeader: { fontSize: 24, fontWeight: "bold", color: "#2D6A4F", textAlign: "center", marginVertical: 16 },
  eventCard: { backgroundColor: "#FFFFFF", borderRadius: 10, padding: 15, marginBottom: 10 },
  eventTitle: { fontSize: 16, fontWeight: "bold", color: "#2D6A4F" },
  eventDate: { fontSize: 14, color: "#6B705C" },
  eventDescription: { fontSize: 14, color: "#2D6A4F" },
  largeCard: { backgroundColor: "#FFFFFF", borderRadius: 10, padding: 15, marginBottom: 10 },
  cardText: { fontSize: 16, fontWeight: "bold", color: "#2D6A4F", marginBottom: 5 },
  cardSubText: { fontSize: 14, color: "#6B705C" },
  profileHeader: { fontSize: 24, fontWeight: "bold", color: "#2D6A4F", textAlign: "center", marginBottom: 16 },
  profileTopSection: { flexDirection: "row", alignItems: "center", marginBottom: 20, paddingHorizontal: 16 },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: "bold", color: "#2D6A4F", marginBottom: 4 },
  profileBio: { fontSize: 14, color: "#2D6A4F" },
  profileIconButton: { flexDirection: "row", backgroundColor: "#B7E4C7", borderRadius: 20, padding: 10, alignItems: "center", marginLeft: 16 },
  logoutButton: { backgroundColor: "#FF6B6B", borderRadius: 10, paddingVertical: 10, alignItems: "center", margin: 16 },
  logoutButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#E4E4E4" },
  navItem: { alignItems: "center" },
  navIconContainer: { padding: 8, borderRadius: 20, marginBottom: 4 },
  navIconActive: { backgroundColor: "#B7E4C7" },
  navText: { fontSize: 14, fontWeight: "500", color: "#2D6A4F" },
  navTextActive: { fontWeight: "bold" },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalCard: { width: "85%", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#2D6A4F", marginBottom: 10 },
  modalInput: { borderWidth: 1, borderColor: "#E4E4E4", borderRadius: 10, padding: 10, fontSize: 16, color: "#000", marginBottom: 15 },
  modalButtonRow: { flexDirection: "row", justifyContent: "space-between" },
  modalCancelButton: { backgroundColor: "#FF6B6B", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  modalSaveButton: { backgroundColor: "#2D6A4F", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  modalButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  bibleText: { fontSize: 16, color: "#2D6A4F" },
  chatUserItem: { padding: 15, borderBottomWidth: 1, borderColor: "#E4E4E4" },
  chatUserName: { fontSize: 16, color: "#2D6A4F" },
  chatMessageBubble: { padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: "80%" },
  myMessage: { backgroundColor: "#B7E4C7", alignSelf: "flex-end" },
  theirMessage: { backgroundColor: "#F8F8F8", alignSelf: "flex-start" },
  chatMessageText: { color: "#000" },
  chatInputContainer: { flexDirection: "row", alignItems: "center", padding: 10, borderTopWidth: 1, borderColor: "#E4E4E4" },
  chatInput: { flex: 1, borderWidth: 1, borderColor: "#E4E4E4", borderRadius: 20, padding: 10, marginRight: 10, backgroundColor: "#FFFFFF" },
  sendButton: { backgroundColor: "#2D6A4F", padding: 10, borderRadius: 20 },
});
// -------------------------------
// BibleScreen Component
// -------------------------------
const BibleScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [bibleText, setBibleText] = useState("Loading...");
  const [loadingBible, setLoadingBible] = useState(true);

  useEffect(() => {
    const fetchBiblePassage = async () => {
      setLoadingBible(true);
      try {
        const response = await fetch("https://bible-api.com/john+3:16");
        const data = await response.json();
        setBibleText(data.text || "Passage not found");
      } catch (e) {
        setBibleText("Error fetching passage");
      }
      setLoadingBible(false);
    };
    fetchBiblePassage();
  }, []);

  return (
    <View style={styles.appContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.mainTitle}>The Bible</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: "#FF6B6B" }]}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ marginTop: 16 }}>
        {loadingBible ? (
          <ActivityIndicator size="large" color="#2D6A4F" />
        ) : (
          <Text style={styles.bibleText}>{bibleText}</Text>
        )}
      </ScrollView>
    </View>
  );
};

// ---------------------------------------
// 2. Main App with Single-File Navigation
// ---------------------------------------
const App: React.FC = () => {
  // 2.1. Auth & Navigation
  const [currentAuthScreen, setCurrentAuthScreen] = useState<"login" | "signup">("login");
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [appsSubScreen, setAppsSubScreen] = useState<AppsSubScreen>("main");
  const [activeTab, setActiveTab] = useState<"home" | "watch" | "apps" | "profile">("home");

  // 2.2. Auth States
  const [users, setUsers] = useState<User[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2.3. Data: Ministries, Events, Services
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  // 2.4. Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [newMessageText, setNewMessageText] = useState("");

  // 2.5. YouTube
  const [latestVideoId, setLatestVideoId] = useState<string>("");
  const [loadingVideo, setLoadingVideo] = useState(false);

  // 2.6. UI Toggles
  const [isGridView, setIsGridView] = useState(true);

  // 2.7. Profile-Image Upload & 2.8. Modals
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

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceSongs, setServiceSongs] = useState("");
  const [serviceTimeline, setServiceTimeline] = useState("");
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

}

  // ----------------------
  // 3. useEffect & AsyncStorage
  // ----------------------
  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem("@all_users");
      if (storedUsers) setUsers(JSON.parse(storedUsers));
      const storedMinistries = await AsyncStorage.getItem("@all_ministries");
      if (storedMinistries) setMinistries(JSON.parse(storedMinistries));
      const storedEvents = await AsyncStorage.getItem("@all_events");
      if (storedEvents) setEvents(JSON.parse(storedEvents));
      const storedServices = await AsyncStorage.getItem("@all_services");
      if (storedServices) setServices(JSON.parse(storedServices));
      const storedChats = await AsyncStorage.getItem("@all_chatMessages");
      if (storedChats) setChatMessages(JSON.parse(storedChats));
      const storedLoggedIn = await AsyncStorage.getItem("@logged_in_user");
      if (storedLoggedIn) {
        const parsedUser = JSON.parse(storedLoggedIn) as User;
        setLoggedInUser(parsedUser);
        setCurrentScreen("home");
      }
    } catch (error) { console.log("Error loading data from AsyncStorage", error); }
  };

  const saveAllData = async () => {
    try {
      await AsyncStorage.setItem("@all_users", JSON.stringify(users));
      await AsyncStorage.setItem("@all_ministries", JSON.stringify(ministries));
      await AsyncStorage.setItem("@all_events", JSON.stringify(events));
      await AsyncStorage.setItem("@all_services", JSON.stringify(services));
      await AsyncStorage.setItem("@all_chatMessages", JSON.stringify(chatMessages));
      if (loggedInUser) {
        await AsyncStorage.setItem("@logged_in_user", JSON.stringify(loggedInUser));
      } else {
        await AsyncStorage.removeItem("@logged_in_user");
      }
    } catch (error) { console.log("Error saving data", error); }
  };

  useEffect(() => { saveAllData(); }, [users, ministries, events, services, loggedInUser, chatMessages]);

  // ----------------------
  // 4. Auth Handlers
  // ----------------------
  const handleLogin = () => {
    const foundUser = users.find((u) => u.email === authEmail && u.password === authPassword);
    if (!foundUser) { Alert.alert("Error", "Invalid credentials or user does not exist."); return; }
    setLoggedInUser(foundUser);
    AsyncStorage.setItem("@logged_in_user", JSON.stringify(foundUser));
    setCurrentScreen("home");
    setActiveTab("home");
  };

  const handleSignup = () => {
    if (!authName.trim() || authEmail.length < 3 || authPassword.length < 3) {
      Alert.alert("Error", "Name, Email, and Password must be valid (>=3 chars)."); return;
    }
    if (authPassword !== confirmPassword) { Alert.alert("Error", "Passwords do not match."); return; }
    const existing = users.some((u) => u.email === authEmail);
    if (existing) { Alert.alert("Error", "User with that email already exists."); return; }
    const newUser: User = { id: Date.now().toString(), name: authName.trim(), email: authEmail.trim(), password: authPassword, photoUrl: "" };
    setUsers([...users, newUser]);
    setLoggedInUser(newUser);
    setCurrentScreen("home");
    setActiveTab("home");
    setAuthName(""); setAuthEmail(""); setAuthPassword(""); setConfirmPassword("");
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
  const pickProfileImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) { Alert.alert("Permission required", "Permission to access camera roll is needed!"); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5,
      });
      if (result.canceled) return;
      if (result.assets && result.assets.length > 0 && loggedInUser) {
        const selectedAsset = result.assets[0];
        const updated = { ...loggedInUser, photoUrl: selectedAsset.uri };
        setLoggedInUser(updated);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      }
    } catch (error) {
      console.error("pickProfileImage error:", error);
      Alert.alert("Error", "Something went wrong while picking the image.");
    }
  };

  // ----------------------
  // 6. Ministries
  // ----------------------
  const handleCreateMinistry = () => {
    if (!ministryTitle.trim()) { Alert.alert("Error", "Ministry must have a title"); return; }
    if (!loggedInUser) { Alert.alert("Error", "Must be logged in to create a ministry"); return; }
    const newMinistry: Ministry = {
      id: Date.now().toString(),
      title: ministryTitle.trim(),
      description: ministryDescription.trim(),
      createdBy: loggedInUser.id,
      people: selectedPeople,
    };
    setMinistries([...ministries, newMinistry]);
    setMinistryTitle(""); setMinistryDescription(""); setSelectedPeople([]); setShowMinistryModal(false);
  };

  // ----------------------
  // 7. Events
  // ----------------------
  const handleCreateEvent = () => {
    if (!eventTitle.trim() || !eventDate || !eventTime) {
      Alert.alert("Error", "Please enter event title, date, and time."); return;
    }
    if (!loggedInUser) { Alert.alert("Error", "Must be logged in to create an event"); return; }
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
    setEventTitle(""); setEventDate(""); setEventTime(""); setEventDescription("");
    setAssignedMinistry(null); setEventAttendees([]); setShowEventModal(false);
  };

  // ----------------------
  // 8. Services
  // ----------------------
  const handleCreateService = () => {
    if (!serviceTitle.trim() || !serviceDate) {
      Alert.alert("Error", "Please enter service title and date."); return;
    }
    if (!loggedInUser) { Alert.alert("Error", "Must be logged in to create a service"); return; }
    const newService: ServiceItem = {
      id: Date.now().toString(),
      title: serviceTitle.trim(),
      date: serviceDate.trim(),
      songs: serviceSongs.split(",").map(song => song.trim()),
      roles: {},
      timeline: serviceTimeline.trim(),
      multimedia: [],
      createdBy: loggedInUser.id,
    };
    setServices([...services, newService]);
    setServiceTitle(""); setServiceDate(""); setServiceSongs(""); setServiceTimeline(""); setShowServiceModal(false);
  };

  // ----------------------
  // 9. YouTube or Home Data
  // ----------------------
  const fetchLatestVideo = async () => {
    try {
      setLoadingVideo(true);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=AIzaSyAMm62FfBdjiChsFajOIIHahwNuPfUId3s&channelId=UCzohr1VLqaLFKoZCdKsHvoQ&part=snippet,id&order=date&maxResults=1`
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
  // 10. Renderers
  // ----------------------
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

  const renderHomeScreen = () => {
    const combinedEvents = events.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    return (
      <FlatList
        key="home"
        ListHeaderComponent={
          <>
            <Text style={styles.watchHeader}>Home</Text>
            {renderVideoCard()}
            <Text style={styles.sectionHeader}>All Events</Text>
          </>
        }
        data={combinedEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>{item.date} @ {item.time}</Text>
            <Text style={styles.eventDescription}>{item.description}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.text}>No upcoming events.</Text>}
        contentContainerStyle={styles.homeScreenScroll}
      />
    );
  };

  const renderWatchScreen = () => (
    <FlatList
      key="watch"
      ListHeaderComponent={
        <>
          <Text style={styles.watchHeader}>Watch</Text>
          {renderVideoCard()}
        </>
      }
      data={[]}
      renderItem={null}
      contentContainerStyle={[styles.homeScreenScroll, { alignItems: "center" }]}
    />
  );

  // ... (Other render functions like renderServicesPage, renderProfileScreen, renderAuthScreen, renderChatListPage, renderChatConversation, etc., would go here)

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
        return (() => {
          switch(appsSubScreen) {
            case "ministry": return renderMinistryPage();
            case "events": return renderEventsPage();
            case "bible": return <BibleScreen onBack={() => setAppsSubScreen("main")} />;
            case "services": return renderServicesPage();
            case "chatList": return renderChatListPage();
            case "chatConversation": return renderChatConversation();
            default: return renderAppsScreen();
          }
        })();
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
        <SafeAreaView style={styles.appContainer}>
          {renderContent()}
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentScreen("home"); setActiveTab("home"); setAppsSubScreen("main"); }}>
              <View style={[styles.navIconContainer, activeTab === "home" && styles.navIconActive]}>
                <Ionicons name="home-outline" size={24} color={activeTab === "home" ? "#FFFFFF" : "#2D6A4F"} />
              </View>
              <Text style={[styles.navText, activeTab === "home" && styles.navTextActive]}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentScreen("watch"); setActiveTab("watch"); setAppsSubScreen("main"); }}>
              <View style={[styles.navIconContainer, activeTab === "watch" && styles.navIconActive]}>
                <Ionicons name="tv-outline" size={24} color={activeTab === "watch" ? "#FFFFFF" : "#2D6A4F"} />
              </View>
              <Text style={[styles.navText, activeTab === "watch" && styles.navTextActive]}>Watch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentScreen("apps"); setActiveTab("apps"); setAppsSubScreen("main"); }}>
              <View style={[styles.navIconContainer, activeTab === "apps" && styles.navIconActive]}>
                <Ionicons name="grid-outline" size={24} color={activeTab === "apps" ? "#FFFFFF" : "#2D6A4F"} />
              </View>
              <Text style={[styles.navText, activeTab === "apps" && styles.navTextActive]}>Apps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentScreen("profile"); setActiveTab("profile"); setAppsSubScreen("main"); }}>
              <View style={[styles.navIconContainer, activeTab === "profile" && styles.navIconActive]}>
                <Ionicons name="person-outline" size={24} color={activeTab === "profile" ? "#FFFFFF" : "#2D6A4F"} />
              </View>
              <Text style={[styles.navText, activeTab === "profile" && styles.navTextActive]}>Profile</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </KeyboardAvoidingView>
  );
};

export default App;

