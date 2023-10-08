import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import {
  getUser,
  updateUser,
  uploadImageToFirebase,
  fetchHuntsForUser,
  fetchUserMappingAndHunts,
  fetchUsernameToUidMapping,
} from "./FirebaseUtils";
import app, { auth, storage } from "../firebaseConfig"; // replace with the actual path to firebaseConfig.js

import * as ImagePicker from "expo-image-picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// or use '@react-native-community/image-picker' depending on your setup

export default function StartPage() {
  const [userData, setUserData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeHunts, setActiveHunts] = useState([]);
  const [plannedHunts, setPlannedHunts] = useState([]);
  const [finishedHunts, setFinishedHunts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const currentUserUID = auth.currentUser?.uid;
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchUsernameToUidMapping()
        .then((mappings) => {
          return fetchHuntsForUser(currentUserUID, mappings);
        })
        .then(({ plannedHunts, activeHunts, completedHunts }) => {
          setPlannedHunts(plannedHunts);
          setActiveHunts(activeHunts);
          setFinishedHunts(completedHunts);
        })
        .catch((error) => {
          Alert.alert(
            "Error",
            "Failed to fetch hunts. Please try again later."
          );
        });
    }, [currentUserUID])
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const data = await getUser(user.uid);
          setUserData(data);

          // Check if the user has a profileImage in the data
          if (data && data.profileImage) {
            setSelectedImage(data.profileImage);
          }
        } catch (error) {}
      } else {
        setUserData(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const uriToBlob = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const handleProfileImageEdit = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // you can adjust this as needed
    });

    if (!result.canceled) {
      const blob = await uriToBlob(result.assets[0].uri);
      const imageUrl = await uploadImageToFirebase(blob, auth.currentUser.uid);
      if (imageUrl) {
        setSelectedImage(imageUrl);
      } else {
        return;
      }
    }
  };
  const navigateToCreateHunt = () => {
    navigation.navigate("Create a hunt");
  };

  const ActiveHuntsList = ({ userId }) => {
    return (
      <View style={styles.listContainer}>
        {activeHunts.map((hunt) => (
          <TouchableOpacity
            key={hunt.huntName}
            onPress={() =>
              navigation.navigate("Confirm", {
                huntDetails: hunt,
                userId: currentUserUID,
              })
            }
          >
            <Text style={{ ...styles.listItem, color: "blue", fontSize: 20 }}>
              {hunt.huntName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const PlannedHuntsList = ({ userId }) => {
    return (
      <View style={styles.listContainer}>
        {plannedHunts.map((hunt) => (
          <Text
            key={hunt.huntName}
            style={{ ...styles.listItem, color: "blue", fontSize: 20 }}
          >
            {hunt.huntName}
          </Text>
        ))}
      </View>
    );
  };

  const MedalsGrid = ({ userId }) => {
    return (
      <View style={styles.listContainer}>
        {finishedHunts.map((hunt) => (
          <Text
            key={hunt.huntName}
            style={{ ...styles.listItem, color: "gold", fontSize: 20 }}
          >
            {hunt.huntName}
          </Text>
        ))}
      </View>
    );
  };

  if (!userData) {
    return <Text style={styles.loading}>Loading...</Text>;
  } else {
    return (
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* User Image */}
          <TouchableOpacity onPress={handleProfileImageEdit}>
            <Image
              style={styles.profileImage}
              source={
                selectedImage && typeof selectedImage === "string"
                  ? { uri: selectedImage }
                  : require("../assets/icon.png")
              }
            />
          </TouchableOpacity>

          {/* Welcome Message */}
          <Text style={styles.welcomeText}>Welcome, {userData.username}!</Text>

          {/* Active Hunts */}
          <Text style={styles.sectionTitle}>Active Hunts</Text>
          <ActiveHuntsList userId={userData.uid} />

          {/* Planned Hunts & Create Hunt Link */}
          <Text style={styles.sectionTitle}>Planned Hunts</Text>
          <PlannedHuntsList userId={userData.uid} />
          <TouchableOpacity onPress={navigateToCreateHunt}>
            <Text style={styles.createHuntLink}>Create Hunt</Text>
          </TouchableOpacity>

          {/* Medals */}
          <Text style={styles.sectionTitle}>Completed Hunts!</Text>
          <MedalsGrid userId={userData.uid} />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start", // changed from 'center' for better layout
    backgroundColor: "#f5f5f5",
    padding: 20,
    paddingTop: 50, // added padding top for better spacing
  },
  loading: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#555",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3, // increased border width for more prominence
    borderColor: "#0066FF", // changed to a bright blue
  },
  editIcon: {
    position: "absolute",
    bottom: "30%",
    right: "42%",
  },
  welcomeText: {
    fontSize: 24, // slightly increased font size
    fontWeight: "bold",
    marginTop: 20,
    color: "#0066FF", // changed to a bright blue
  },
  listContainer: {
    width: "100%",
    padding: 10,
    marginTop: 15, // added top margin for spacing
    borderRadius: 10, // added for rounded corners
    backgroundColor: "#FFF", // white background for each list section
    elevation: 3, // shadow for android
    shadowOffset: { width: 1, height: 1 }, // shadow for iOS
    shadowColor: "#333",
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  listItem: {
    padding: 10,
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    fontSize: 16, // increased font size
    color: "#555", // darker text color for better readability
  },
  sectionTitle: {
    fontSize: 18, // increased font size
    fontWeight: "bold",
    color: "#333", // dark text color
    marginTop: 25, // spacing before each section
  },
  createHuntLink: {
    textAlign: "center", // center aligned text
    marginTop: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#0066FF", // bright blue background
    color: "#FFF", // white text
    fontWeight: "bold",
    width: "50%", // half the parent width
    alignSelf: "center", // center align this element
  },
});
