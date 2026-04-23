import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { User, ClipboardList, ShieldAlert, Plus, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import QRGenerator from '../components/QRGenerator';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { getMedicalRecords, addMedicalRecord } from '../services/recordService';

const PatientDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [diagnostico, setDiagnostico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../services/firebase');
        
        const docRef = doc(db, 'patients', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPatient({ id: docSnap.id, ...docSnap.data() });
          
          const recordsData = await getMedicalRecords(docSnap.id);
          setRecords(recordsData);
        }
      } catch (error) {
        console.error("Error fetching patient", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [id]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    
    const result = await Swal.fire({
      title: '¿Confirmar Historial?',
      text: '⚠️ ATENCIÓN: Este registro médico será INMUTABLE. Una vez guardado, no podrá ser modificado ni eliminado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, Firmar y Guardar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setSaving(true);
      try {
        const recordData = {
          doctorId: currentUser.uid,
          doctorName: currentUser.email,
          numeroColegiado: 'COL-12345',
          diagnostico,
          observaciones
        };
        
        const newRecord = await addMedicalRecord(patient.id, recordData);
        setRecords([newRecord, ...records]);
        setDiagnostico('');
        setObservaciones('');
        
        Swal.fire('Guardado!', 'El registro ha sido añadido al historial.', 'success');
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Hubo un problema al guardar el registro.', 'error');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) return <Loader fullScreen />;
  
  if (!patient) return (
    <div>
      <Navbar />
      <div className="container pt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Paciente no encontrado</h2>
        <Link to="/" className="btn btn-primary">Volver al Panel</Link>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="container animate-fade-in py-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            
            {/* Header / Info */}
            <div className="card flex items-center gap-6">
              <div className="bg-background p-4 rounded-full text-primary">
                <User size={48} />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{patient.nombre}</h1>
                <p className="text-text-secondary text-lg">DNI: {patient.dni}</p>
                <div className="mt-2">
                  <Link to={`/emergency/${patient.dni}`} target="_blank" className="inline-flex items-center gap-1 text-danger font-medium text-sm hover:underline">
                    <ExternalLink size={16} /> Ver Perfil de Emergencia
                  </Link>
                </div>
              </div>
            </div>

            {/* Add Record Form */}
            <div className="card">
              <h2 className="flex items-center gap-2 text-xl font-bold mb-6 text-primary">
                <Plus /> Nuevo Registro Médico
              </h2>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md mb-6 flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                <div className="text-sm">
                  <strong>Aviso de Inmutabilidad:</strong> Los registros médicos guardados en este sistema no pueden ser editados ni eliminados. Asegúrese de que toda la información sea correcta antes de firmar.
                </div>
              </div>
              <form onSubmit={handleAddRecord}>
                <div className="form-group">
                  <label className="form-label">Diagnóstico</label>
                  <input
                    type="text"
                    className="form-control"
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                    required
                    placeholder="Ej. Faringitis aguda"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Observaciones</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    required
                    placeholder="Detalles del tratamiento, prescripciones, etc."
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Firmar y Guardar Registro'}
                </button>
              </form>
            </div>

            {/* Timeline of Records */}
            <div className="card">
              <h2 className="flex items-center gap-2 text-xl font-bold mb-6">
                <ClipboardList className="text-primary" /> Historial Médico
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
                          <strong>Firmado por:</strong> {record.doctorName} (Col. {record.numeroColegiado})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <QRGenerator dni={patient.dni} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
