import { auth, storage } from './config/firebase';
import { signInAnonymously } from 'firebase/auth';

console.log('Firebase Auth:', auth);
console.log('Firebase Storage:', storage);

// Test connection (optional)
signInAnonymously(auth)
  .then(() => {
    console.log('Firebase connection successful!');
  })
  .catch((error) => {
    console.log('Firebase connection error:', error);
  });