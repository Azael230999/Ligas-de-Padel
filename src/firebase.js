import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  connectFirestoreEmulator,
} from "firebase/firestore";

// El config de un web app de Firebase es público a propósito (no es un
// secreto): la seguridad de los datos la dan firestore.rules, no esta key.
// Ver https://firebase.google.com/docs/projects/api-keys
const firebaseConfig = {
  apiKey: "AIzaSyAzEk63Tcoj5kwFliZT0PI5Qdg41s-W5Hs",
  authDomain: "liga-de-padel-8f0da.firebaseapp.com",
  projectId: "liga-de-padel-8f0da",
  storageBucket: "liga-de-padel-8f0da.firebasestorage.app",
  messagingSenderId: "845103977027",
  appId: "1:845103977027:web:85fb12ba9e6d4691aebaf6",
  measurementId: "G-V0GDQQRFYW",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
});

// Para desarrollo local con `firebase emulators:start` (ver README).
if (import.meta.env.VITE_USE_EMULATORS === "true") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
