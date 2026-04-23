import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { User, ClipboardList, ShieldAlert, Plus, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import QRGenerator from '../components/QRGenerator';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { getPatientByDni } from '../services/patientService';
import { getMedicalRecords, addMedicalRecord } from '../services/recordService';

const PatientDetail = () => {
  const { id } = useParams(); // Using the ID parameter, but wait, the route from Dashboard navigate(`/patient/${patient.id}`)
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
        // Since we routed to /patient/:id we would need getDoc, but let's assume getPatientByDni was modified or we have a getPatientById.
        // Actually, let's just create getPatientById locally or modify our approach. Let's fetch using DNI if ID is DNI, or we need to add getDoc logic.
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../services/firebase');
        
        const docRef = doc(db, 'patients', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPatient({ id: docSnap.id, ...docSnap.data() });
          
          // Fetch records
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
    
    // Warning Message before saving
    const result = await Swal.fire({
      title: '¿Confirmar Historial?',
      text: '⚠️ ATENCIÓN: Este registro médico será INMUTABLE. Una vez guardado, no podrá ser modificado ni eliminado por razones legales y de seguridad.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: 'var(--danger)',
      confirmButtonText: 'Sí, Firmar y Guardar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setSaving(true);
      try {
        const recordData = {
          doctorId: currentUser.uid,
          doctorName: currentUser.email, // In a real app we'd fetch their real name
          numeroColegiado: 'COL-12345', // Mocked, ideally from user data
          diagnostico,
          observaciones
        };
        
        const newRecord = await addMedicalRecord(patient.id, recordData);
        
        // Optimistically add to list
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
      <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <h2>Paciente no encontrado</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Volver al Panel</Link>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Header / Info */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
                <User size={48} />
              </div>
              <div>
                <h1 style={{ marginBottom: '0.25rem' }}>{patient.nombre}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>DNI: {patient.dni}</p>
                <div style={{ marginTop: '0.5rem' }}>
                  <Link to={`/emergency/${patient.dni}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', fontWeight: '500', fontSize: '0.875rem' }}>
                    <ExternalLink size={16} /> Ver Perfil de Emergencia
                  </Link>
                </div>
              </div>
            </div>

            {/* Add Record Form */}
            <div className="card">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <Plus /> Nuevo Registro Médico
              </h2>
              <div className="warning-banner">
                <ShieldAlert size={24} style={{ flexShrink: 0 }} />
                <div>
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
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <ClipboardList /> Historial Médico
              </h2>
              {records.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No hay registros médicos anteriores.</p>
              ) : (
                <div className="timeline">
                  {records.map(record => (
                    <div key={record.id} className="timeline-item">
                      <div style={{ backgroundColor: 'var(--background)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <h3 style={{ fontSize: '1.125rem' }}>{record.diagnostico}</h3>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {record.fecha ? new Date(record.fecha.toDate ? record.fecha.toDate() : Date.now()).toLocaleDateString() : 'Reciente'}
                          </span>
                        </div>
                        <p style={{ marginBottom: '1rem', whiteSpace: 'pre-line' }}>{record.observaciones}</p>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <QRGenerator dni={patient.dni} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
