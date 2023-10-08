import React, { useEffect, useRef } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Camera } from "expo-camera";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  const {
    selectedDestination,
    destinations,
    completedDestinations,
    huntName,
    userId,
  } = route.params; // Removed onPhotoTaken

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
      }
    })();
  }, []);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const { uri } = await cameraRef.current.takePictureAsync();
      navigation.navigate("Preview Screen", {
        uri,
        destinations,
        completedDestinations,
        selectedDestination,
        huntName: huntName,
        userId: userId,
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} ref={cameraRef}>
        <View
          style={{
            flex: 1,
            backgroundColor: "transparent",
          }}
        >
          <View
            style={{
              position: "absolute",
              bottom: 20, // Set some space at the bottom
              left: 0,
              right: 0,
              justifyContent: "center", // This will center the child elements horizontally
              alignItems: "center", // This will center the child elements vertically
            }}
          >
            <TouchableOpacity onPress={takePhoto}>
              <Text style={{ fontSize: 18, color: "white" }}>Snap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
}
