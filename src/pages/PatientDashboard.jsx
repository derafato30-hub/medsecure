import React, { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { User, ClipboardList, ShieldAlert, HeartPulse, Edit, Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import QRGenerator from '../components/QRGenerator';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { getMedicalRecords } from '../services/recordService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PatientDashboard = () => {
  const { currentUser } = useAuth();
  
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  const [emergencyData, setEmergencyData] = useState({});
  const pdfRef = useRef(null);

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

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    setGeneratingPDF(true);
    
    try {
      const canvas = await html2canvas(pdfRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ficha_Emergencia_${patient.dni}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
      Swal.fire('Error', 'No se pudo generar el PDF', 'error');
    } finally {
      setGeneratingPDF(false);
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
            <div className="card flex justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="bg-background p-4 rounded-full text-primary">
                  <User size={48} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{patient.nombre}</h2>
                  <p className="text-text-secondary text-lg">DNI: {patient.dni}</p>
                </div>
              </div>
              <button onClick={generatePDF} disabled={generatingPDF} className="btn btn-primary hidden md:flex">
                <Download className="w-4 h-4" />
                {generatingPDF ? 'Generando...' : 'Exportar Ficha PDF'}
              </button>
            </div>

            {/* Printable Area Reference */}
            <div ref={pdfRef} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
                <h2 className="flex items-center gap-2 text-xl font-bold text-danger">
                  <HeartPulse className="w-6 h-6" /> Ficha de Emergencia Médica
                </h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn btn-outline text-sm py-1 px-3" data-html2canvas-ignore>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-red-800 font-bold mb-1 text-xs uppercase">Paciente</p>
                    <p className="font-semibold text-slate-900">{patient.nombre} (DNI: {patient.dni})</p>
                  </div>
                  <div>
                    <p className="text-red-800 font-bold mb-1 text-xs uppercase">Tipo de Sangre</p>
                    <p className="text-2xl font-black text-slate-900">{patient.emergencyProfile?.bloodType || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-red-800 font-bold mb-1 text-xs uppercase">Alergias</p>
                    <p className="font-semibold text-slate-900">{patient.emergencyProfile?.allergies || 'Ninguna'}</p>
                  </div>
                  <div>
                    <p className="text-red-800 font-bold mb-1 text-xs uppercase">Enfermedades Críticas</p>
                    <p className="font-semibold text-slate-900">{patient.emergencyProfile?.criticalDiseases || 'Ninguna'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-red-800 font-bold mb-1 text-xs uppercase">Contactos de Emergencia</p>
                    <p className="font-semibold text-slate-900 whitespace-pre-line">{patient.emergencyProfile?.emergencyContacts || 'No especificados'}</p>
                  </div>
                  <div className="flex gap-4 sm:col-span-2 pt-4 border-t border-slate-100">
                    <div>
                      <span className="font-bold text-xs text-text-secondary uppercase block mb-1">Donante de Órganos</span>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${patient.emergencyProfile?.organDonor ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                        {patient.emergencyProfile?.organDonor ? 'SÍ' : 'NO'}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-xs text-text-secondary uppercase block mb-1">Acepta Transfusiones</span>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${patient.emergencyProfile?.acceptsTransfusions ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {patient.emergencyProfile?.acceptsTransfusions ? 'SÍ' : 'NO'}
                      </span>
                    </div>
                  </div>
                  
                  {/* QR included only for PDF print logic, visually hidden via CSS or styled neatly */}
                  <div className="sm:col-span-2 flex justify-center mt-6 border-t border-slate-100 pt-6">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-2">Escanea para verificar validez</p>
                      <QRGenerator dni={patient.dni} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button onClick={generatePDF} disabled={generatingPDF} className="btn btn-primary md:hidden w-full">
              <Download className="w-4 h-4" />
              {generatingPDF ? 'Generando...' : 'Exportar Ficha PDF'}
            </button>

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
