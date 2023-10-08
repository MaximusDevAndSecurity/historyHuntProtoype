import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function CreateHuntPage() {
  const [huntName, setHuntName] = useState("");
  const [huntDuration, setHuntDuration] = useState("");
  const [error, setError] = useState("");

  const navigation = useNavigation();

  const handleContinue = () => {
    if (!huntName.trim() || !huntDuration.trim()) {
      setError("Both fields need to be filled!"); // Set error message
      return;
    }

    navigation.navigate("Locations", {
      huntName: huntName,
      huntDuration: huntDuration,
    });
  };

  return (
    <View style={styles.container}>
      <Text>Name your Hunt:</Text>
      <TextInput
        value={huntName}
        onChangeText={setHuntName}
        style={styles.input}
        placeholder="Enter hunt name"
      />
      <Text>Estimate Duration:</Text>
      <TextInput
        value={huntDuration}
        onChangeText={setHuntDuration}
        style={styles.input}
        placeholder="Enter estimated duration"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {/* 3. Display error message */}
      <Button title="Continue" onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    margin: 10,
    padding: 5,
    borderRadius: 5,
  },
  errorText: {
    // Style for the error message
    color: "red",
    marginBottom: 10,
  },
});
