import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBpC_pJ-c63n6pJUTL9my4fjr1DE1-9i8",
  authDomain: "atharv-electrical-chakan.firebaseapp.com",
  projectId: "atharv-electrical-chakan",
  storageBucket: "atharv-electrical-chakan.firebasestorage.app",
  messagingSenderId: "560570685600",
  appId: "1:560570685600:web:4b806dca50a6dbb4a24c53"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testSync() {
  console.log('Testing Firestore connection and product sync...');

  // 1. Fetch current products
  const snap = await getDocs(collection(db, 'products'));
  console.log(`Current products count in Firestore: ${snap.size}`);

  // Note: Firestore Security Rules require authentication with admin claims to write to products!
  console.log('Firestore read is public and verified!');
}

testSync().catch(console.error);
