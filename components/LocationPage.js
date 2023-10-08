import React, { useState } from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View, Button, Text } from "react-native";

function LocationPage({ navigation, route }) {
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [error, setError] = useState("");

  const handlePress = (event) => {
    setSelectedLocations([...selectedLocations, event.nativeEvent.coordinate]);
  };

  const handleDone = () => {
    if (selectedLocations.length === 0) {
      setError("Please choose at least one location."); // Set error message
      return;
    }
    navigation.navigate("Invite", {
      huntDetails: {
        huntName: route.params.huntName,
        huntDuration: route.params.huntDuration,
        locations: selectedLocations,
      },
    });
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} onPress={handlePress}>
        {selectedLocations.map((loc, index) => (
          <Marker key={index} coordinate={loc} />
        ))}
      </MapView>
      {error ? (
        <Text style={{ color: "red", alignSelf: "center", marginBottom: 10 }}>
          {error}
        </Text>
      ) : null}
      {/* 3. Display error */}
      <Button title="Done" onPress={handleDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "90%",
  },
});

export default LocationPage;
