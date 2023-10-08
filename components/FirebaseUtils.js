import firebaseApp from "../firebaseConfig";
import {
  getDatabase,
  ref,
  push as dbPush,
  get,
  child,
  update,
  remove,
  onValue,
  set,
  orderByChild,
  where,
  query,
  equalTo,
} from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const db = getDatabase();
const storage = getStorage();
const usersRef = ref(db, "users/");

// Save user information
export const saveUser = (userData) => {
  set(ref(db, "users/" + userData.uid), {
    username: userData.username,
  });
};

export const getUser = (userID) => {
  // Create a reference to the user's data
  const userRef = child(ref(db), `users/${userID}`);

  // Fetch the user data
  return get(userRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    })
    .catch((error) => {
      throw error; // You can throw the error to handle it further up if needed
    });
};

export const updateUser = async (userID, updatedData) => {
  const userChildRef = ref(usersRef, userID);
  return update(userChildRef, updatedData);
};

export const deleteUser = async (userID) => {
  const userChildRef = ref(usersRef, userID);
  return remove(userChildRef);
};

export const observeUsers = (callback) => {
  onValue(usersRef, (snapshot) => {
    callback(snapshot.val());
  });
};

export async function uploadImageToFirebase(blob, userID) {
  const filename = `${userID}_${Date.now()}.png`;
  const imageRef = storageRef(storage, `profile_images/${filename}`);
  try {
    await uploadBytes(imageRef, blob);
    const url = await getDownloadURL(imageRef);

    // Update the user's profileImage in Realtime Database
    if (url) {
      const userRef = ref(db, `users/${userID}`);
      await update(userRef, { profileImage: url });
    }

    return url;
  } catch (e) {
    return null;
  }
}
// Save hunt information
export const saveHunt = async (finalHuntDetails, creatorUID, participants) => {
  const db = getDatabase();
  const huntsRef = ref(db, "hunts/");
  const usersRef = ref(db, "users/");

  // Ensure there's a valid locations property on finalHuntDetails.
  if (!finalHuntDetails.locations) {
    if (finalHuntDetails.location) {
      finalHuntDetails.locations = [finalHuntDetails.location];
      delete finalHuntDetails.location;
    } else {
      throw new Error("No valid location data provided");
    }
  }

  // Create a new hunt entry and store it.
  const newHuntRef = dbPush(huntsRef);
  try {
    const huntPayload = {
      ...finalHuntDetails,
      creatorUID,
      participants: participants.map((participant) => participant.username), // Just the usernames
    };

    await set(newHuntRef, huntPayload);

    const updates = {
      [`${creatorUID}/plannedHunts/${newHuntRef.key}`]: true,
    };

    // Loop through the participants to fetch UID by username and update their activeHunts.
    for (let participant of participants) {
      const usernameQuery = query(
        usersRef,
        orderByChild("username"),
        equalTo(participant.username)
      );
      const snapshot = await get(usernameQuery);

      if (snapshot.exists()) {
        const userUID = Object.keys(snapshot.val())[0]; // Extract the UID from the snapshot
        updates[`${userUID}/activeHunts/${newHuntRef.key}`] = true;
      } else {
      }
    }

    await update(ref(db, "users"), updates);
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = () => {
  return get(usersRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        return Object.values(snapshot.val()); // Converts fetched data to an array of user objects
      } else {
        return [];
      }
    })
    .catch((error) => {
      throw error;
    });
};

export const fetchUsernameToUidMapping = async () => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const usersRef = ref(db, "users");

    onValue(
      usersRef,
      (snapshot) => {
        const users = snapshot.val();
        const usernameToUid = {};

        for (let uid in users) {
          usernameToUid[users[uid].username] = uid;
        }

        resolve(usernameToUid);
      },
      (error) => {
        reject(error);
      }
    );
  });
};

export const fetchHuntsForUser = async (userId) => {
  const db = getDatabase();
  const userHuntsRef = ref(db, `users/${userId}`);

  try {
    const snapshot = await get(userHuntsRef);
    const userData = snapshot.val();

    let plannedHunts = [];
    let activeHunts = [];
    let completedHunts = [];

    if (userData && userData.plannedHunts) {
      for (const huntId of Object.keys(userData.plannedHunts)) {
        const huntSnapshot = await get(ref(db, `hunts/${huntId}`));
        const huntData = huntSnapshot.val();
        if (huntData) {
          plannedHunts.push(huntData);
        }
      }
    }

    if (userData && userData.activeHunts) {
      for (const huntId of Object.keys(userData.activeHunts)) {
        const huntSnapshot = await get(ref(db, `hunts/${huntId}`));
        const huntData = huntSnapshot.val();
        if (huntData) {
          activeHunts.push(huntData);
        }
      }
    }

    // Fetching detailed data for completedHunts
    if (userData && userData.completedHunts) {
      for (const huntId of Object.keys(userData.completedHunts)) {
        const huntSnapshot = await get(ref(db, `hunts/${huntId}`));
        const huntData = huntSnapshot.val();
        if (huntData) {
          completedHunts.push(huntData);
        }
      }
    }

    return { plannedHunts, activeHunts, completedHunts };
  } catch (error) {
    throw error;
  }
};

export const markHuntAsCompleted = async (userID, huntName) => {
  const usersRef = ref(db, `users/${userID}`);
  const huntsRef = ref(db, "hunts");
  const huntQuery = query(
    huntsRef,
    orderByChild("huntName"),
    equalTo(huntName)
  );

  try {
    const huntSnapshot = await get(huntQuery);
    if (!huntSnapshot.exists()) {
      throw new Error("Hunt not found.");
    }

    const huntID = Object.keys(huntSnapshot.val())[0];

    const updates = {
      [`activeHunts/${huntID}`]: null, // Remove from activeHunts
      [`completedHunts/${huntID}`]: true, // Add to completedHunts
    };

    await update(usersRef, updates);
  } catch (error) {
    throw error;
  }
};
