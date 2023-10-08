import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Button, Alert, StyleSheet } from "react-native";
import { getAllUsers, saveHunt } from "./FirebaseUtils";
import { auth } from "../firebaseConfig";

const InvitePage = ({ navigation, route }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);

  const huntDetails = route.params.huntDetails;
  const locationDetails = route.params.locationDetails;

  useEffect(() => {
    getAllUsers()
      .then((fetchedUsers) => {
        const usersWithUids = Object.keys(fetchedUsers).map((uid) => ({
          uid,
          ...fetchedUsers[uid],
        }));
        setContacts(usersWithUids);
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to fetch users. Please try again later.");
      });
  }, []);

  const toggleContactSelect = useCallback(
    (contact) => {
      if (selectedContacts.some((selected) => selected.uid === contact.uid)) {
        setSelectedContacts((prev) =>
          prev.filter((item) => item.uid !== contact.uid)
        );
      } else {
        setSelectedContacts((prev) => [...prev, contact]);
      }
    },
    [selectedContacts]
  );

  const onDonePress = useCallback(async () => {
    if (selectedContacts.length > 0) {
      const names = selectedContacts
        .map((contact) => contact.username)
        .join(", ");
      Alert.alert("Users Selected", `You've invited: ${names}`);
      const participantUIDs = selectedContacts.map((contact) => contact);
      const finalHuntDetails = {
        ...huntDetails,
        participantUIDs,
      };
      const creatorUID = auth.currentUser?.uid;

      // Using UIDs for the saveHunt function
      try {
        await saveHunt(finalHuntDetails, creatorUID, participantUIDs);
        navigation.navigate("Start");
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to create hunt. Please try again later.",
          error
        );
      }
    } else {
      Alert.alert("Please Select Users");
    }
  }, [huntDetails, locationDetails, selectedContacts, navigation]);

  const renderItem = useCallback(
    ({ item }) => (
      <ListItem
        contact={item}
        onToggle={toggleContactSelect}
        isSelected={selectedContacts.some(
          (selected) => selected.uid === item.uid
        )}
      />
    ),
    [selectedContacts]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.uid}
      />
      <Button title="Done" onPress={onDonePress} />
    </View>
  );
};

const ListItem = ({ contact, onToggle, isSelected }) => (
  <Text
    style={[styles.contactItem, isSelected ? styles.selected : {}]}
    onPress={() => onToggle(contact)}
  >
    {contact.username}
  </Text>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contactItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  selected: {
    backgroundColor: "#eaeaea",
  },
});

export default InvitePage;
