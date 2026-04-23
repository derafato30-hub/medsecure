import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Esta es la pieza que faltaba: La API KEY desde tus variables de entorno
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

// Función para registrar la cuenta de Auth sin cerrar la sesión del Doctor
export const registerPatientAuth = async (email, password) => {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });

  const data = await response.json();

  if (!response.ok) {
    // Si ves este error en la consola, sabremos qué falló exactamente
    throw new Error(data.error.message);
  }

  return data.localId; // Este es el UID del nuevo paciente
};

// Helper para buscar por DNI
export const getPatientByDni = async (dni) => {
  const patientsRef = collection(db, 'patients');
  const q = query(patientsRef, where('dni', '==', dni));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// Crear el perfil vinculado al UID de Auth
export const createPatient = async (uid, patientData) => {
  const patientRef = doc(db, 'patients', uid);
  const data = {
    ...patientData,
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
  };
  await setDoc(patientRef, data);
  return { id: uid, ...data };
};

export const updateEmergencyProfile = async (patientId, emergencyProfileData) => {
  const patientRef = doc(db, 'patients', patientId);
  await updateDoc(patientRef, {
    emergencyProfile: emergencyProfileData
  });
};