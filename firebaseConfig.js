// Import the functions you need from the SDKs you need
import { initializeApp, } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6Vo3fBQzBAeEfObyKW-st0ak51bwYpC0",
  authDomain: "historyhunt-eac4e.firebaseapp.com",
  databaseURL: "https://historyhunt-eac4e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "historyhunt-eac4e",
  storageBucket: "historyhunt-eac4e.appspot.com",
  messagingSenderId: "785824273148",
  appId: "1:785824273148:web:9ac93bea461d42924dfd79",
  measurementId: "G-QX8TYGE5X8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const storage = getStorage(app);
const database = getDatabase(app);

export { auth, storage, database };
export default app;
