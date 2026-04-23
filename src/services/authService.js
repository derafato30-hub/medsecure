import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Verify user role
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    return { user, role: userDoc.data().role, data: userDoc.data() };
  } else {
    await signOut(auth);
    throw new Error('Access denied: Role not found.');
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

export const registerPatientAsDoctor = async (patientData) => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  
  // Create user via REST API so it doesn't log out the doctor
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: patientData.email,
      password: patientData.password,
      returnSecureToken: false
    })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Error registering patient auth');
  }
  
  const uid = data.localId;
  
  // Set user role
  await setDoc(doc(db, 'users', uid), {
    role: 'patient',
    email: patientData.email
  });
  
  // Create patient document with UID matching the Auth UID
  await setDoc(doc(db, 'patients', uid), {
    dni: patientData.dni,
    nombre: patientData.nombre,
    fechaNacimiento: patientData.fechaNacimiento,
    createdAt: serverTimestamp(),
    emergencyProfile: {
      bloodType: '',
      allergies: '',
      criticalDiseases: '',
      emergencyContacts: '',
      insurance: '',
      acceptsTransfusions: false,
      organDonor: false,
    }
  });
  
  return uid;
};

export const registerPublicPatient = async (patientData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, patientData.email, patientData.password);
  const uid = userCredential.user.uid;

  // Set user role
  await setDoc(doc(db, 'users', uid), {
    role: 'patient',
    email: patientData.email
  });
  
  // Create patient document
  await setDoc(doc(db, 'patients', uid), {
    dni: patientData.dni,
    nombre: patientData.nombre,
    fechaNacimiento: patientData.fechaNacimiento,
    createdAt: serverTimestamp(),
    emergencyProfile: {
      bloodType: '',
      allergies: '',
      criticalDiseases: '',
      emergencyContacts: '',
      insurance: '',
      acceptsTransfusions: false,
      organDonor: false,
    }
  });

  return uid;
};

export const changeUserPassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No hay usuario autenticado.");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  
  // Re-autenticar al usuario
  await reauthenticateWithCredential(user, credential);
  
  // Actualizar contraseña
  await updatePassword(user, newPassword);
};
