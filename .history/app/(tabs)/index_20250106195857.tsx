// App.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types for events and ministries
interface EventItem {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface Ministry {
  id: string;
  title: string;
  description: string;
}

interface AppData {
  events: EventItem[];
  ministries: Ministry[];
}

const App: React.FC = () => {
  // 1) Our local AppData state
  const [appData, setAppData] = useState<AppData>({
    events: [],
    ministries: [],
  });

  // 2) UI states for adding new items
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddMinistryModal, setShowAddMinistryModal] = useState(false);

  // Fields for event
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  // Fields for ministry
  const [ministryTitle, setMinistryTitle] = useState("");
  const [ministryDesc, setMinistryDesc] = useState("");

  // On app load, retrieve any existing data from AsyncStorage
  useEffect(() => {
    loadAppData();
  }, []);

  // --------------------------------------------
  // LOAD & SAVE APP DATA
  // --------------------------------------------
  const loadAppData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("@app_data");
      if (storedData) {
        const parsed: AppData = JSON.parse(storedData);
        setAppData(parsed);
      }
    } catch (error) {
      console.log("Error loading @app_data from storage:", error);
    }
  };

  const saveAppData = async (newData: AppData) => {
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem("@app_data", JSON.stringify(newData));
      // Update local state
      setAppData(newData);
    } catch (error) {
      console.log("Error saving @app_data:", error);
      Alert.alert("Error", "Failed to save data.");
    }
  };

  // --------------------------------------------
  // ADD NEW EVENT
  // --------------------------------------------
  const handleAddEvent = () => {
    if (!eventTitle.trim()) {
      Alert.alert("Error", "Event title cannot be empty!");
      return;
    }
    // Create new event item
    const newEvent: EventItem = {
      id: Date.now().toString(),
      title: eventTitle.trim(),
      date: eventDate.trim() || "No Date",
      description: eventDescription.trim() || "No Description",
    };

    // Merge into existing events
    const updatedData: AppData = {
      ...appData,
      events: [...appData.events, newEvent],
    };

    // Save & update state
    saveAppData(updatedData);

    // Reset fields & close modal
    setEventTitle("");
    setEventDate("");
    setEventDescription("");
    setShowAddEventModal(false);
  };

  // --------------------------------------------
  // ADD NEW MINISTRY
  // --------------------------------------------
  const handleAddMinistry = () => {
    if (!ministryTitle.trim()) {
      Alert.alert("Error", "Ministry title cannot be empty!");
      return;
    }
    const newMinistry: Ministry = {
      id: Date.now().toString(),
      title: ministryTitle.trim(),
      description: ministryDesc.trim() || "No Description",
    };

    const updatedData: AppData = {
      ...appData,
      ministries: [...appData.ministries, newMinistry],
    };

    saveAppData(updatedData);

    setMinistryTitle("");
    setMinistryDesc("");
    setShowAddMinistryModal(false);
  };

  // --------------------------------------------
  // RENDER EVENT ITEM
  // --------------------------------------------
  const renderEventItem = ({ item }: { item: EventItem }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>{item.date}</Text>
      <Text style={styles.cardSubtitle}>{item.description}</Text>
    </View>
  );

  // --------------------------------------------
  // RENDER MINISTRY ITEM
  // --------------------------------------------
  const renderMinistryItem = ({ item }: { item: Ministry }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>{item.description}</Text>
    </View>
  );

  // --------------------------------------------
  // MAIN RENDER
  // --------------------------------------------
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={styles.heading}>Local JSON Data Example</Text>

        {/* Events Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Events</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddEventModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Event</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={appData.events}
          keyExtractor={(item) => item.id}
          renderItem={renderEventItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No events yet. Add some!</Text>
          }
        />

        {/* Ministries Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>Ministries</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddMinistryModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Ministry</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={appData.ministries}
          keyExtractor={(item) => item.id}
          renderItem={renderMinistryItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No ministries yet. Add some!</Text>
          }
        />

        {/* ADD EVENT MODAL */}
        <Modal visible={showAddEventModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
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
                style={[styles.input, { height: 80 }]}
                multiline
                placeholder="Event Description"
                value={eventDescription}
                onChangeText={setEventDescription}
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#ccc" }]}
                  onPress={() => setShowAddEventModal(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#2D6A4F" }]}
                  onPress={handleAddEvent}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ADD MINISTRY MODAL */}
        <Modal visible={showAddMinistryModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New Ministry</Text>
              <TextInput
                style={styles.input}
                placeholder="Ministry Title"
                value={ministryTitle}
                onChangeText={setMinistryTitle}
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                multiline
                placeholder="Ministry Description"
                value={ministryDesc}
                onChangeText={setMinistryDesc}
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#ccc" }]}
                  onPress={() => setShowAddMinistryModal(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#2D6A4F" }]}
                  onPress={handleAddMinistry}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

// --------------------------------------------
// STYLES
// --------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8EE",
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
  },
  addButton: {
    backgroundColor: "#2D6A4F",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2D6A4F",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#6B705C",
  },
  emptyText: {
    color: "#6B705C",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 8,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D6A4F",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#F8F8F8",
    color: "#000",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
  },
});

export default App;
