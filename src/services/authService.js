import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const loginDoctor = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Verify if the user is a doctor in Firestore
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists() && userDoc.data().role === 'doctor') {
    return { user, role: 'doctor', data: userDoc.data() };
  } else {
    await signOut(auth);
    throw new Error('Access denied: You do not have doctor privileges.');
  }
};

export const logout = () => signOut(auth);

// Helper for initial setup to create a doctor account if needed (remove in prod)
export const setupDoctorAccount = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    role: 'doctor',
    ...data
  });
};
