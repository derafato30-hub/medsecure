import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { User, ClipboardList, ShieldAlert, HeartPulse, Edit } from 'lucide-react';
import Navbar from '../components/Navbar';
import QRGenerator from '../components/QRGenerator';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { getMedicalRecords } from '../services/recordService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const PatientDashboard = () => {
  const { currentUser } = useAuth();
  
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [emergencyData, setEmergencyData] = useState({});

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'patients', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setPatient(data);
          setEmergencyData(data.emergencyProfile || {});
          
          // Fetch records
          const recordsData = await getMedicalRecords(currentUser.uid);
          setRecords(recordsData);
        }
      } catch (error) {
        console.error("Error fetching patient", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [currentUser]);

  const handleEmergencyUpdate = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, 'patients', currentUser.uid);
      await updateDoc(docRef, { emergencyProfile: emergencyData });
      setPatient(prev => ({ ...prev, emergencyProfile: emergencyData }));
      setIsEditing(false);
      Swal.fire('Guardado', 'Perfil de emergencia actualizado', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo actualizar el perfil', 'error');
    }
  };

  if (loading) return <Loader fullScreen />;
  
  if (!patient) return (
    <div>
      <Navbar />
      <div className="container pt-8 text-center">
        <h2 className="text-xl font-bold">Perfil no encontrado</h2>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="container animate-fade-in py-8">
        <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Header / Info */}
            <div className="card flex items-center gap-6">
              <div className="bg-background p-4 rounded-full text-primary">
                <User size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{patient.nombre}</h2>
                <p className="text-text-secondary text-lg">DNI: {patient.dni}</p>
              </div>
            </div>

            {/* Emergency Profile Editor */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="flex items-center gap-2 text-xl font-bold text-danger">
                  <HeartPulse className="w-6 h-6" /> Perfil de Emergencia Público
                </h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn btn-outline text-sm py-1 px-3">
                    <Edit className="w-4 h-4" /> Editar
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleEmergencyUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Tipo de Sangre</label>
                    <input type="text" className="form-control" value={emergencyData.bloodType || ''} onChange={e => setEmergencyData({...emergencyData, bloodType: e.target.value})} placeholder="Ej. O+" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alergias</label>
                    <input type="text" className="form-control" value={emergencyData.allergies || ''} onChange={e => setEmergencyData({...emergencyData, allergies: e.target.value})} />
                  </div>
                  <div className="form-group md:col-span-2">
                    <label className="form-label">Enfermedades Críticas</label>
                    <textarea className="form-control" rows="2" value={emergencyData.criticalDiseases || ''} onChange={e => setEmergencyData({...emergencyData, criticalDiseases: e.target.value})} />
                  </div>
                  <div className="form-group md:col-span-2">
                    <label className="form-label">Contactos de Emergencia</label>
                    <textarea className="form-control" rows="2" value={emergencyData.emergencyContacts || ''} onChange={e => setEmergencyData({...emergencyData, emergencyContacts: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Seguro Médico</label>
                    <input type="text" className="form-control" value={emergencyData.insurance || ''} onChange={e => setEmergencyData({...emergencyData, insurance: e.target.value})} />
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={emergencyData.organDonor || false} onChange={e => setEmergencyData({...emergencyData, organDonor: e.target.checked})} />
                      Donante de Órganos
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={emergencyData.acceptsTransfusions || false} onChange={e => setEmergencyData({...emergencyData, acceptsTransfusions: e.target.checked})} />
                      Acepta Transfusiones
                    </label>
                  </div>
                  <div className="md:col-span-2 flex gap-4 mt-4">
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><span className="font-semibold text-text-secondary">Tipo de Sangre:</span> {patient.emergencyProfile?.bloodType || 'No especificado'}</div>
                  <div><span className="font-semibold text-text-secondary">Alergias:</span> {patient.emergencyProfile?.allergies || 'Ninguna'}</div>
                  <div className="sm:col-span-2"><span className="font-semibold text-text-secondary">Enfermedades:</span> {patient.emergencyProfile?.criticalDiseases || 'Ninguna'}</div>
                  <div className="sm:col-span-2"><span className="font-semibold text-text-secondary">Contactos:</span> <br/>{patient.emergencyProfile?.emergencyContacts || 'No especificados'}</div>
                  <div><span className="font-semibold text-text-secondary">Seguro:</span> {patient.emergencyProfile?.insurance || 'No especificado'}</div>
                  <div>
                    <span className="font-semibold text-text-secondary">Donante:</span> {patient.emergencyProfile?.organDonor ? 'Sí' : 'No'} | 
                    <span className="font-semibold text-text-secondary ml-2">Transfusiones:</span> {patient.emergencyProfile?.acceptsTransfusions ? 'Sí' : 'No'}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline of Records (Read Only) */}
            <div className="card">
              <h2 className="flex items-center gap-2 text-xl font-bold mb-6">
                <ClipboardList className="text-primary" /> Mi Historial Médico
              </h2>
              {records.length === 0 ? (
                <p className="text-text-secondary">No hay registros médicos anteriores.</p>
              ) : (
                <div className="timeline">
                  {records.map(record => (
                    <div key={record.id} className="timeline-item">
                      <div className="bg-background p-5 rounded-md border border-border">
                        <div className="flex justify-between mb-3">
                          <h3 className="text-lg font-bold">{record.diagnostico}</h3>
                          <span className="text-sm text-text-secondary">
                            {record.fecha ? new Date(record.fecha.toDate ? record.fecha.toDate() : Date.now()).toLocaleDateString() : 'Reciente'}
                          </span>
                        </div>
                        <p className="mb-4 whitespace-pre-line text-slate-700">{record.observaciones}</p>
                        <div className="text-sm text-text-secondary border-t border-border pt-3">
                          <strong>Atendido por:</strong> {record.doctorName} (Col. {record.numeroColegiado})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="card text-center flex flex-col items-center">
              <h3 className="font-bold mb-2">Tu Código de Emergencia</h3>
              <p className="text-sm text-text-secondary mb-4">Muestra este código a los paramédicos para acceso rápido a tu perfil vital.</p>
              <QRGenerator dni={patient.dni} />
            </div>
            
            <div className="warning-banner">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <div className="text-sm">
                <strong>Información Protegida:</strong> Tu historial médico es inmutable. Si observas un error, comunícate con tu médico tratante.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
