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
