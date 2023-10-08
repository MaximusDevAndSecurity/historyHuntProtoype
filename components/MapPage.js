import React, { useState, useEffect, useCallback } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { View, Button } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import haversine from "haversine";

function MapPage() {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [route, setRoute] = useState([]);
  const [canTakePhoto, setCanTakePhoto] = useState(false);
  const [locationSubscriber, setLocationSubscriber] = useState(null);
  const [completedDestinations, setCompletedDestinations] = useState([]); // New state to keep track of completed destinations
  const [photoTaken, setPhotoTaken] = useState(false);

  const navigation = useNavigation();
  const routeParams = useRoute();
  const { huntDetails, userId } = routeParams.params;
  const huntName = huntDetails.huntName;

  const calculateCanTakePhoto = useCallback(() => {
    if (selectedDestination && currentPosition) {
      const start = {
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
      };

      const end = {
        latitude: selectedDestination.latitude,
        longitude: selectedDestination.longitude,
      };

      const distance = haversine(start, end, { unit: "meter" }); // Calculate distance in meters
      setCanTakePhoto(distance <= 10); // Allow to take a photo if within 10 meters
    }
  }, [selectedDestination, currentPosition]);

  useEffect(() => {
    calculateCanTakePhoto();
  }, [calculateCanTakePhoto]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1, // Receive updates whenever the device has moved 1 meter
        },
        (location) => {
          setCurrentPosition({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      setLocationSubscriber(subscriber);
    })();

    return () => {
      if (locationSubscriber) {
        locationSubscriber.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (huntDetails) {
      setDestinations(huntDetails.locations || []);
    }
  }, [huntDetails]);

  useEffect(() => {
    if (selectedDestination && currentPosition) {
      setRoute([currentPosition, selectedDestination]);
    }
  }, [selectedDestination, currentPosition]);

  useEffect(() => {
    if (photoTaken) {
      handlePhotoTaken(selectedDestination);
      setPhotoTaken(false); // Reset photoTaken state back to false
    }
  }, [photoTaken]);

  const handleNavigation = () => {
    if (canTakePhoto) {
      navigation.navigate("Camera", {
        // Pass any information you need to the CameraScreen
        selectedDestination,
        destinations,
        completedDestinations,
        huntName: huntName,
        userId: userId,
      });
    }
  };

  const handlePhotoTaken = (destination) => {
    // Handle what should happen when a photo is taken
    setCompletedDestinations([...completedDestinations, destination]); // Mark the destination as completed
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // When this screen is focused, check if selectedDestination is completed, if not, mark it as completed
      if (
        selectedDestination &&
        !completedDestinations.includes(selectedDestination)
      ) {
        setCompletedDestinations((prev) => [...prev, selectedDestination]);
      }
    });

    return unsubscribe;
  }, [navigation, selectedDestination, completedDestinations]);

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }}>
        {currentPosition && (
          <Marker coordinate={currentPosition} title="You are here" />
        )}
        {destinations.map((destination, index) => (
          <Marker
            key={index}
            coordinate={destination}
            pinColor={
              completedDestinations.includes(destination) ? "green" : "red"
            }
            onPress={() =>
              !completedDestinations.includes(destination) &&
              setSelectedDestination(destination)
            }
          />
        ))}

        {route.length > 0 && <Polyline coordinates={route} />}
      </MapView>
      {canTakePhoto && (
        <Button title="Go to Selected Destination" onPress={handleNavigation} />
      )}
    </View>
  );
}

export default MapPage;
