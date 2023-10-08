import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { auth } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { saveUser } from "./FirebaseUtils";

function AuthPage({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);

  const register = async () => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = response.user.uid;
      const userData = {
        uid: uid,
        username: username,
      };
      saveUser(userData);
      setIsRegisterModalVisible(false);

      Alert.alert("Success", "Registration successful!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation or state change to show user is logged in
      navigation.navigate("Start");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={signIn} />
      <Text
        style={styles.registerText}
        onPress={() => setIsRegisterModalVisible(true)}
      >
        Register here
      </Text>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isRegisterModalVisible}
      >
        <View style={styles.modalView}>
          <TextInput
            placeholder="Username"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Register" onPress={register} />
          <Button
            title="Cancel"
            onPress={() => setIsRegisterModalVisible(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 10,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#1f1f1f",
    color: "#fff",
  },
  registerText: {
    marginTop: 15,
    color: "#aaa",
    textDecorationLine: "underline",
  },
  modalView: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
});

export default AuthPage;
