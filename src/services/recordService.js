import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Add a medical record (Immutable)
export const addMedicalRecord = async (patientId, recordData) => {
  const recordsRef = collection(db, 'patients', patientId, 'records');
  const newRecord = {
    ...recordData,
    fecha: serverTimestamp() // Enforced by rules or logic
  };
  
  const docRef = await addDoc(recordsRef, newRecord);
  return { id: docRef.id, ...newRecord };
};

// Get all medical records for a patient
export const getMedicalRecords = async (patientId) => {
  const recordsRef = collection(db, 'patients', patientId, 'records');
  const q = query(recordsRef, orderBy('fecha', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
