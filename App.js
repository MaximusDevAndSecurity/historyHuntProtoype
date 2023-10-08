import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
console.disableYellowBox = true;

//components
import AuthPage from "./components/AuthPage";
import InvitePage from "./components/InvitePage";
import StartPage from "./components/StartPage";
import CreateHuntPage from "./components/CreateHuntPage";
import LocationPage from "./components/LocationPage";
import ConfirmHuntPage from "./components/ConfirmHuntPage";
import MapPage from "./components/MapPage";
import CameraScreen from "./components/CameraScreen";
import PhotoPreviewScreen from "./components/PhotoPreviewScreen";

const Stack = createStackNavigator();

export default function App() {
  console.disableYellowBox = true;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={AuthPage} />
        <Stack.Screen name="Start" component={StartPage} />
        <Stack.Screen name="Create a hunt" component={CreateHuntPage} />
        <Stack.Screen name="Locations" component={LocationPage} />
        <Stack.Screen name="Invite" component={InvitePage} />
        <Stack.Screen name="Confirm" component={ConfirmHuntPage} />
        <Stack.Screen name="Map" component={MapPage} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Preview Screen" component={PhotoPreviewScreen} />
        {/* ... other screens ... */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
