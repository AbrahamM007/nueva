// App.tsx

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
type AppsSubScreen = "main" | "ministry" | "events" | "bible" | "services" | "chatList" | "chatConversation";

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

  // ----------------------
  // 3. useEffect & AsyncStorage
  // ----------------------
  useEffect(() => {
    loadAllData();
  }, []);

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
    } catch (error) {
      console.log("Error loading data from AsyncStorage", error);
    }
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
    } catch (error) {
      console.log("Error saving data", error);
    }
  };

  useEffect(() => {
    saveAllData();
  }, [users, ministries, events, services, loggedInUser, chatMessages]);

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
    const newUser: User = {
      id: Date.now().toString(),
      name: authName.trim(),
      email: authEmail.trim(),
      password: authPassword,
      photoUrl: "",
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
  const pickProfileImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission required", "Permission to access camera roll is needed!");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
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
  // 8. Services
  // ----------------------
  const handleCreateService = () => {
    if (!serviceTitle.trim() || !serviceDate) {
      Alert.alert("Error", "Please enter service title and date.");
      return;
    }
    if (!loggedInUser) {
      Alert.alert("Error", "Must be logged in to create a service");
      return;
    }
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
    setServiceTitle("");
    setServiceDate("");
    setServiceSongs("");
    setServiceTimeline("");
    setShowServiceModal(false);
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
            <Text style={styles.eventDate}>
              {item.date} @ {item.time}
            </Text>
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

  const toggleView = () => {
    setIsGridView((prev) => !prev);
  };

  const renderAppsScreen = () => {
    if (appsSubScreen === "ministry") return renderMinistryPage();
    if (appsSubScreen === "events") return renderEventsPage();
    if (appsSubScreen === "bible") return <BibleScreen onBack={() => setAppsSubScreen("main")} />;
    if (appsSubScreen === "services") return renderServicesPage();
    if (appsSubScreen === "chatList") return renderChatListPage();
    if (appsSubScreen === "chatConversation") return renderChatConversation();

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
          { label: "Bible", icon: "book-outline", onPress: () => setAppsSubScreen("bible") },
          { label: "Services", icon: "musical-notes-outline", onPress: () => setAppsSubScreen("services") },
          { label: "Preaching", icon: "megaphone-outline", onPress: () => {} },
          { label: "Donation", icon: "wallet-outline", onPress: () => {} },
          { label: "Chat", icon: "chatbubble-ellipses-outline", onPress: () => setAppsSubScreen("chatList") },
          { label: "Life Groups", icon: "leaf-outline", onPress: () => {} },
        ]}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.appButton} onPress={item.onPress}>
            <Ionicons name={item.icon} size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.appButtonText}>{item.label}</Text>
          </TouchableOpacity>
        )}
        numColumns={isGridView ? 2 : 1}
        columnWrapperStyle={isGridView ? { justifyContent: "space-between" } : undefined}
        contentContainerStyle={[styles.homeScreenScroll, { alignItems: isGridView ? "center" : "flex-start" }]}
      />
    );
  };

  const renderMinistryPage = () => {
    const handleAddMinistry = () => {
      setShowMinistryModal(true);
    };
  
    return (
      <View style={styles.appContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.mainTitle}>Ministries</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMinistry}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={ministries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.ministryCard}>
              <Text style={styles.ministryTitle}>{item.title}</Text>
              <Text style={styles.ministryDescription}>{item.description}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.text}>No ministries available.</Text>}
          contentContainerStyle={styles.ministryList}
        />
        {showMinistryModal && (
          <Modal transparent={true} animationType="slide" visible={showMinistryModal}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New Ministry</Text>
              <TextInput
                style={styles.input}
                placeholder="Ministry Title"
                value={ministryTitle}
                onChangeText={setMinistryTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Ministry Description"
                value={ministryDescription}
                onChangeText={setMinistryDescription}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleCreateMinistry}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowMinistryModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
      </View>
    );
  };
  

  const renderEventsPage = () => {
    const handleAddEvent = () => {
      setShowEventModal(true);
    };
  
    return (
      <View style={styles.appContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.mainTitle}>Events</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDate}>{item.date} @ {item.time}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.text}>No events available.</Text>}
          contentContainerStyle={styles.eventList}
        />
        {showEventModal && (
          <Modal transparent={true} animationType="slide" visible={showEventModal}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <TextInput
                style={styles.input}
                placeholder="Event Title"
                value={eventTitle}
                onChangeText={setEventTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Event Date"
                value={eventDate}
                onChangeText={setEventDate}
              />
              <TextInput
                style={styles.input}
                placeholder="Event Time"
                value={eventTime}
                onChangeText={setEventTime}
              />
              <TextInput
                style={styles.input}
                placeholder="Event Description"
                value={eventDescription}
                onChangeText={setEventDescription}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleCreateEvent}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEventModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
      </View>
    );
  };
  

  const renderServicesPage = () => {
    const sortedServices = [...services].sort((a, b) => parseInt(b.id) - parseInt(a.id));
    return (
      <View style={styles.appContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.mainTitle}>Services</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#FF6B6B" }]}
            onPress={() => setAppsSubScreen("main")}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowServiceModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", marginLeft: 8 }}>Plan Service</Text>
        </TouchableOpacity>
        <FlatList
          data={sortedServices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.largeCard}>
              <Text style={styles.cardText}>{item.title} on {item.date}</Text>
              <Text style={styles.cardSubText}>Timeline: {item.timeline}</Text>
              <Text style={styles.cardSubText}>
                Songs: {item.songs.join(", ")}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.text}>No services planned yet.</Text>}
          contentContainerStyle={styles.homeScreenScroll}
        />
        <Modal visible={showServiceModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Plan Service</Text>
              <ScrollView style={{ maxHeight: 400 }}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Service Title"
                  value={serviceTitle}
                  onChangeText={setServiceTitle}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Service Date (YYYY-MM-DD)"
                  value={serviceDate}
                  onChangeText={setServiceDate}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Songs (comma separated)"
                  value={serviceSongs}
                  onChangeText={setServiceSongs}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Timeline/Notes"
                  value={serviceTimeline}
                  onChangeText={setServiceTimeline}
                />
                <Text style={styles.sectionHeader}>Assign Teams/Roles (Coming Soon)</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={() => Alert.alert("Upload", "Feature coming soon.")}>
                  <Text style={styles.uploadButtonText}>Upload Multimedia</Text>
                </TouchableOpacity>
              </ScrollView>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowServiceModal(false);
                    setServiceTitle("");
                    setServiceDate("");
                    setServiceSongs("");
                    setServiceTimeline("");
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveButton} onPress={handleCreateService}>
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const renderProfileScreen = () => {
    if (!loggedInUser) {
      return (
        <View style={[styles.appContainer, { justifyContent: "center", alignItems: "center" }]}>
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
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

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
              <Text style={currentAuthScreen === "login" ? styles.authToggleTextActive : styles.authToggleTextInactive}>
                Log In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={currentAuthScreen === "signup" ? styles.authToggleActive : styles.authToggleInactive}
              onPress={() => setCurrentAuthScreen("signup")}
            >
              <Text style={currentAuthScreen === "signup" ? styles.authToggleTextActive : styles.authToggleTextInactive}>
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

  const renderChatListPage = () => {
    if (!loggedInUser) return <Text>Please log in</Text>;
    return (
      <View style={styles.appContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.mainTitle}>Chats</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#FF6B6B" }]}
            onPress={() => setAppsSubScreen("main")}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={users.filter(u => u.id !== loggedInUser.id)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatUserItem}
              onPress={() => {
                setChatPartner(item);
                setAppsSubScreen("chatConversation");
              }}
            >
              <Text style={styles.chatUserName}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.text}>No other users.</Text>}
        />
      </View>
    );
  };

  const sendMessage = () => {
    if (!newMessageText.trim()) return;
    if (!loggedInUser || !chatPartner) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: loggedInUser.id,
      receiverId: chatPartner.id,
      text: newMessageText.trim(),
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, newMsg]);
    setNewMessageText("");
  };

  const renderChatConversation = () => {
    if (!loggedInUser || !chatPartner) return <Text>Error: Missing chat context.</Text>;

    const conversationMessages = chatMessages
      .filter(
        (msg) =>
          (msg.senderId === loggedInUser.id && msg.receiverId === chatPartner.id) ||
          (msg.senderId === chatPartner.id && msg.receiverId === loggedInUser.id)
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    return (
      <View style={styles.appContainer}>
        <View style={styles.sectionHeaderRow}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: "#FF6B6B" }]}
            onPress={() => setAppsSubScreen("chatList")}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.mainTitle}>{chatPartner.name}</Text>
          <View style={{ width: 40 }} />
        </View>
        <FlatList
          data={conversationMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.chatMessageBubble,
                item.senderId === loggedInUser.id ? styles.myMessage : styles.theirMessage,
              ]}
            >
              <Text style={styles.chatMessageText}>{item.text}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 16 }}
        />
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Type a message..."
            value={newMessageText}
            onChangeText={setNewMessageText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
    width: "90%",
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D6A4F",
    margin: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#2D6A4F",
  },
  uploadButton: {
    backgroundColor: "#B7E4C7",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  uploadButtonText: {
    color: "#2D6A4F",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#2D6A4F",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
  },
  appButton: {
    backgroundColor: "#2D6A4F",
    borderRadius: 20,
    padding: 10,
    margin: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  appButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  toggleViewButton: {
    backgroundColor: "#2D6A4F",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  toggleViewButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  text: { fontSize: 16, color: "#2D6A4F", textAlign: "center" },
  watchHeader: { fontSize: 24, fontWeight: "bold", color: "#2D6A4F", textAlign: "center", marginVertical: 16 },
  eventCard: { backgroundColor: "#FFFFFF", borderRadius: 10, padding: 15, marginBottom: 10 },
  eventTitle: { fontSize: 16, fontWeight: "bold", color: "#2D6A4F" },
  eventDate: { fontSize: 14, color: "#6B705C" },
  eventDescription: { fontSize: 14, color: "#2D6A4F" },
  largeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 5,
  },
  cardSubText: {
    fontSize: 14,
    color: "#6B705C",
  },
  modalContainer: { flex: 1, backgroundColor: "#D8F3DC", justifyContent: "center", alignItems: "center" },
  modalCard: { width: "85%", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#2D6A4F", marginBottom: 10 },
  modalInput: { borderWidth: 1, borderColor: "#E4E4E4", borderRadius: 10, padding: 10, fontSize: 16, color: "#000", marginBottom: 15 },
  modalButtonRow: { flexDirection: "row", justifyContent: "space-between" },
  modalCancelButton: { backgroundColor: "#FF6B6B", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  modalSaveButton: { backgroundColor: "#2D6A4F", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  modalButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  ministryList: { paddingHorizontal: 16, paddingBottom: 20 },
  ministryCard: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  ministryTitle: { fontSize: 18, fontWeight: "bold", color: "#2D6A4F", marginBottom: 4 },
  ministryDescription: { fontSize: 14, color: "#374151" },
  bibleText: {
    fontSize: 16,
    color: "#2D6A4F",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#2D6A4F",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF6B6B",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  eventList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  profileHeader: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D6A4F",
    textAlign: "center",
    marginBottom: 16,
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
  logoutButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    margin: 16,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  chatUserItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#E4E4E4",
  },
  chatUserName: {
    fontSize: 16,
    color: "#2D6A4F",
  },
  chatMessageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#B7E4C7",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#F8F8F8",
    alignSelf: "flex-start",
  },
  chatMessageText: {
    color: "#000",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#E4E4E4",
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  sendButton: {
    backgroundColor: "#2D6A4F",
    padding: 10,
    borderRadius: 20,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E4E4E4",
  },
  navItem: {
    alignItems: "center",
  },
  navIconContainer: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  navIconActive: {
    backgroundColor: "#B7E4C7",
  },
  navText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D6A4F",
  },
  navTextActive: {
    fontWeight: "bold",
  },
  
});


export default App;
