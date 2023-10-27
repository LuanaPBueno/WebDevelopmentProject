import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBtdygAOBNlyLsrpNcoJMANkKekK8TplEA",
  authDomain: "fluxograma-puc.firebaseapp.com",
  projectId: "fluxograma-puc",
  storageBucket: "fluxograma-puc.appspot.com",
  messagingSenderId: "666515590929",
  appId: "1:666515590929:web:855bd8905182b00f4d46b0"
};

const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);
