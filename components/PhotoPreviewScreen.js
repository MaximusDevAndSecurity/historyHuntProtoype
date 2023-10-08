import React from "react";
import { View, Text, Image, Button } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { markHuntAsCompleted } from "./FirebaseUtils";

function PhotoPreviewScreen() {
  const {
    uri,
    destinations,
    completedDestinations,
    selectedDestination,
    onBack,
    huntName,
    userId,
  } = useRoute().params;
  const navigation = useNavigation();

  const remainingDestinations = destinations.filter(
    (dest) =>
      !completedDestinations.includes(dest) && dest !== selectedDestination
  ).length;

  const huntDetails = {
    huntName: huntName,
    locations: destinations,
  };

  const handleBack = () => {
    navigation.navigate("Map", {
      newCompletedDestination: selectedDestination,
      huntDetails: huntDetails,
      userId: userId,
    });
  };
  const handleFinishHunt = async () => {
    try {
      await markHuntAsCompleted(userId, huntName);
      navigation.navigate("Start"); // Navigate to the topmost screen in the stack (assuming it's the main/home screen).
    } catch (error) {
      alert("There was an issue finishing the hunt. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image source={{ uri }} style={{ width: 200, height: 200 }} />
      <Text>{`${remainingDestinations} Destinations Remaining`}</Text>

      {remainingDestinations === 0 ? (
        <Button title="Finish Hunt" onPress={handleFinishHunt} />
      ) : (
        <Button title="Back to Map" onPress={handleBack} />
      )}
    </View>
  );
}

export default PhotoPreviewScreen;
