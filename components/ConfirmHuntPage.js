import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";

function ConfirmHuntPage() {
  const navigation = useNavigation();
  const route = useRoute();

  const { huntDetails, userId } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.huntName}>{huntDetails.huntName}</Text>
        <Text style={styles.huntDuration}>
          Estimated Duration: {huntDetails.huntDuration}
        </Text>
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: huntDetails.locations[0]?.latitude || 37.78825,
          longitude: huntDetails.locations[0]?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {huntDetails.locations.map((location, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={`Location ${index + 1}`}
          />
        ))}
      </MapView>

      <View style={styles.footer}>
        <Button
          title="Confirm"
          onPress={() =>
            navigation.navigate("Map", {
              huntDetails: huntDetails,
              userId: userId,
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d1d1",
  },
  huntName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  huntDuration: {
    marginTop: 5,
    fontSize: 16,
    color: "#555",
  },
  map: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 0.5,
    borderTopColor: "#d1d1d1",
  },
});

export default ConfirmHuntPage;
