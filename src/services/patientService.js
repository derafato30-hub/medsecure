import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Helper to find a patient by DNI
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

// Create a new patient profile
export const createPatient = async (patientData) => {
  // Using a custom ID (e.g. DNI) or let Firestore generate one
  const newPatientRef = doc(collection(db, 'patients'));
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
  await setDoc(newPatientRef, data);
  return { id: newPatientRef.id, ...data };
};

// Update emergency profile
export const updateEmergencyProfile = async (patientId, emergencyProfileData) => {
  const patientRef = doc(db, 'patients', patientId);
  await updateDoc(patientRef, {
    emergencyProfile: emergencyProfileData
  });
};
