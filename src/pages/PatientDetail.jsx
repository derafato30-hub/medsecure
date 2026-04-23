import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { User, ClipboardList, ShieldAlert, Plus, ExternalLink, FileText, Activity, Link as LinkIcon } from 'lucide-react';
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
  const [recetaMedica, setRecetaMedica] = useState('');
  const [examenesSolicitados, setExamenesSolicitados] = useState('');
  const [remisiones, setRemisiones] = useState('');
  const [saving, setSaving] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState({ nombre: '', colegiatura: '' });

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
    
    const fetchDoctorData = async () => {
      if (!currentUser) return;
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../services/firebase');
        const docRef = doc(db, 'doctors_directory', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDoctorInfo({
            nombre: docSnap.data().nombre,
            colegiatura: docSnap.data().colegiatura
          });
        }
      } catch (error) {
        console.error("Error fetching doctor info", error);
      }
    };
    
    fetchPatientData();
    fetchDoctorData();
  }, [id, currentUser]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    
    const result = await Swal.fire({
      title: '¿Confirmar Historial?',
      text: '⚠️ ATENCIÓN: Este registro médico y sus evidencias asociadas serán INMUTABLES. Asegúrese de que todos los datos son correctos.',
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
          doctorName: doctorInfo.nombre || currentUser.email,
          numeroColegiado: doctorInfo.colegiatura || 'N/A',
          diagnostico,
          observaciones,
          recetaMedica: recetaMedica.trim() || null,
          examenesSolicitados: examenesSolicitados.trim() || null,
          remisiones: remisiones.trim() || null
        };
        
        const newRecord = await addMedicalRecord(patient.id, recordData);
        setRecords([newRecord, ...records]);
        
        setDiagnostico('');
        setObservaciones('');
        setRecetaMedica('');
        setExamenesSolicitados('');
        setRemisiones('');
        
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
                  <strong>Aviso de Inmutabilidad:</strong> Los registros y evidencias guardadas no pueden ser editadas ni eliminadas. Revisa exhaustivamente antes de firmar.
                </div>
              </div>
              <form onSubmit={handleAddRecord}>
                <div className="form-group">
                  <label className="form-label">Diagnóstico Principal</label>
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
                  <label className="form-label">Observaciones Clínicas</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    required
                    placeholder="Signos vitales, exploración física, etc."
                  ></textarea>
                </div>

                <h3 className="font-bold text-lg mt-8 mb-4 border-b border-border pb-2">Evidencias Estructuradas (Opcional)</h3>

                <div className="form-group">
                  <label className="form-label flex items-center gap-2"><FileText className="w-4 h-4" /> Receta Médica</label>
                  <textarea
                    className="form-control bg-slate-50"
                    rows="2"
                    value={recetaMedica}
                    onChange={(e) => setRecetaMedica(e.target.value)}
                    placeholder="Medicamentos, dosis, frecuencia o URL del PDF de la receta"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label flex items-center gap-2"><Activity className="w-4 h-4" /> Exámenes Solicitados</label>
                    <textarea
                      className="form-control bg-slate-50"
                      rows="2"
                      value={examenesSolicitados}
                      onChange={(e) => setExamenesSolicitados(e.target.value)}
                      placeholder="Hemograma, Rx Torax, etc."
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Remisiones / Interconsultas</label>
                    <textarea
                      className="form-control bg-slate-50"
                      rows="2"
                      value={remisiones}
                      onChange={(e) => setRemisiones(e.target.value)}
                      placeholder="Derivación a cardiología..."
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full mt-4" disabled={saving}>
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
                        
                        {/* Render Evidences */}
                        {(record.recetaMedica || record.examenesSolicitados || record.remisiones) && (
                          <div className="bg-white border border-slate-200 rounded p-4 mt-4 mb-4 grid grid-cols-1 gap-3">
                            <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wide">Evidencias Adjuntas</h4>
                            {record.recetaMedica && (
                              <div><strong className="text-slate-800 text-sm">Receta:</strong> <span className="text-slate-600 text-sm">{record.recetaMedica}</span></div>
                            )}
                            {record.examenesSolicitados && (
                              <div><strong className="text-slate-800 text-sm">Exámenes:</strong> <span className="text-slate-600 text-sm">{record.examenesSolicitados}</span></div>
                            )}
                            {record.remisiones && (
                              <div><strong className="text-slate-800 text-sm">Remisiones:</strong> <span className="text-slate-600 text-sm">{record.remisiones}</span></div>
                            )}
                          </div>
                        )}

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
