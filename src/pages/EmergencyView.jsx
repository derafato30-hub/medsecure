import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle, HeartPulse, Phone, ShieldAlert } from 'lucide-react';
import { getPatientByDni } from '../services/patientService';
import Loader from '../components/Loader';

const EmergencyView = () => {
  const { dni } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await getPatientByDni(dni);
        if (data) {
          setPatient(data);
        } else {
          setError('Paciente no encontrado');
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar datos de emergencia');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [dni]);

  if (loading) return <Loader fullScreen />;

  if (error || !patient) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50 p-4">
        <div className="card text-center border-red-300">
          <ShieldAlert className="w-12 h-12 text-red-600 mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-red-600 mb-2">{error || 'Error'}</h2>
          <p className="text-slate-700">No se pudo acceder a la información de emergencia para el DNI: {dni}</p>
          <Link to="/" className="inline-block mt-4 text-primary underline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const ep = patient.emergencyProfile || {};

  return (
    <div className="min-h-screen bg-red-50 py-12 px-4">
      <div className="container max-w-3xl animate-fade-in">
        
        <div className="text-center mb-8">
          <AlertCircle className="w-16 h-16 text-red-600 mb-4 mx-auto" />
          <h1 className="text-red-800 text-4xl font-black mb-2 uppercase tracking-wide">
            PERFIL DE EMERGENCIA
          </h1>
          <p className="text-xl text-red-900 font-medium">
            {patient.nombre} (DNI: {patient.dni})
          </p>
        </div>

        <div className="card border-2 border-red-200 mb-6 bg-white">
          <div className="flex items-center gap-3 mb-6 text-red-600 border-b border-red-100 pb-4">
            <HeartPulse className="w-6 h-6" />
            <h2 className="text-xl font-bold m-0">Datos Médicos Críticos</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-red-800 font-bold mb-1 text-sm uppercase">Tipo de Sangre</p>
              <p className="text-3xl font-black text-slate-900">{ep.bloodType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-red-800 font-bold mb-1 text-sm uppercase">Alergias</p>
              <p className="font-semibold text-lg text-slate-900">{ep.allergies || 'Ninguna conocida'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-red-800 font-bold mb-1 text-sm uppercase">Enfermedades Críticas</p>
              <p className="font-semibold text-lg text-slate-900">{ep.criticalDiseases || 'Ninguna registrada'}</p>
            </div>
          </div>
        </div>

        <div className="card border-2 border-red-200 bg-white">
          <div className="flex items-center gap-3 mb-6 text-red-600 border-b border-red-100 pb-4">
            <Phone className="w-6 h-6" />
            <h2 className="text-xl font-bold m-0">Contacto e Información Adicional</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <p className="text-red-800 font-bold mb-1 text-sm uppercase">Contactos de Emergencia</p>
              <p className="font-semibold text-lg text-slate-900 whitespace-pre-line">{ep.emergencyContacts || 'No especificados'}</p>
            </div>
            <div>
              <p className="text-red-800 font-bold mb-1 text-sm uppercase">Seguro Médico</p>
              <p className="font-semibold text-lg text-slate-900">{ep.insurance || 'No especificado'}</p>
            </div>
            <div className="flex flex-wrap gap-8 mt-2">
              <div>
                <p className="text-red-800 font-bold mb-2 text-sm uppercase">Donante de Órganos</p>
                <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${ep.organDonor ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                  {ep.organDonor ? 'SÍ' : 'NO'}
                </span>
              </div>
              <div>
                <p className="text-red-800 font-bold mb-2 text-sm uppercase">Acepta Transfusiones</p>
                <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${ep.acceptsTransfusions ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {ep.acceptsTransfusions ? 'SÍ' : 'NO'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default EmergencyView;
