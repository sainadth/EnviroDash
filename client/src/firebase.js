import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDnrMNctMKU_O33O0G_qD5PCHxZU3YaFEY",
  authDomain: "envirodash-815ff.firebaseapp.com",
  projectId: "envirodash-815ff",
  storageBucket: "envirodash-815ff.firebasestorage.app",
  messagingSenderId: "620480777806",
  appId: "1:620480777806:web:51b5f34c952f7e8abb7d1f",
  measurementId: "G-GW1T5QKLT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});