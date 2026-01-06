import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjAVzkPnImFEiT1f8PWxOJLX3FT-KnuuU",
  authDomain: "kust-equipment-app.firebaseapp.com",
  projectId: "kust-equipment-app",
  storageBucket: "kust-equipment-app.firebasestorage.app",
  messagingSenderId: "248937827012",
  appId: "1:248937827012:web:43aace7d956fc6cfd19791",
  measurementId: "G-Y7C3WVQ53P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


