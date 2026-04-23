import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle, HeartPulse, Activity, Phone, ShieldAlert } from 'lucide-react';
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--emergency-bg)' }}>
        <div className="card" style={{ textAlign: 'center', borderColor: 'var(--emergency-border)' }}>
          <ShieldAlert size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--danger)' }}>{error || 'Error'}</h2>
          <p>No se pudo acceder a la información de emergencia para el DNI: {dni}</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--primary)', textDecoration: 'underline' }}>Volver al inicio</Link>
        </div>
      </div>
    );
  }

  const ep = patient.emergencyProfile || {};

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--emergency-bg)', padding: '2rem 1rem' }}>
      <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <AlertCircle size={64} color="var(--danger)" style={{ marginBottom: '1rem' }} />
          <h1 style={{ color: 'var(--emergency-text)', fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '900', textTransform: 'uppercase' }}>
            PERFIL DE EMERGENCIA
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#7f1d1d' }}>
            <strong>{patient.nombre}</strong> (DNI: {patient.dni})
          </p>
        </div>

        <div className="card" style={{ borderColor: 'var(--emergency-border)', borderWidth: '2px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--danger)' }}>
            <HeartPulse size={24} />
            <h2 style={{ margin: 0 }}>Datos Médicos Críticos</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p className="form-label" style={{ color: 'var(--emergency-text)' }}>Tipo de Sangre</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{ep.bloodType || 'No especificado'}</p>
            </div>
            <div>
              <p className="form-label" style={{ color: 'var(--emergency-text)' }}>Alergias</p>
              <p style={{ fontWeight: '500' }}>{ep.allergies || 'Ninguna conocida'}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="form-label" style={{ color: 'var(--emergency-text)' }}>Enfermedades Críticas</p>
              <p style={{ fontWeight: '500' }}>{ep.criticalDiseases || 'Ninguna registrada'}</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ borderColor: 'var(--emergency-border)', borderWidth: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--danger)' }}>
            <Phone size={24} />
            <h2 style={{ margin: 0 }}>Contacto e Información Adicional</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div>
              <p className="form-label" style={{ color: 'var(--emergency-text)' }}>Contactos de Emergencia</p>
              <p style={{ fontWeight: '500', whiteSpace: 'pre-line' }}>{ep.emergencyContacts || 'No especificados'}</p>
            </div>
            <div>
              <p className="form-label" style={{ color: 'var(--emergency-text)' }}>Seguro Médico</p>
              <p style={{ fontWeight: '500' }}>{ep.insurance || 'No especificado'}</p>
            </div>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              <div>
                <p className="form-label" style={{ color: 'var(--emergency-text)' }}>Donante de Órganos</p>
                <span style={{ 
                  display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem', 
                  backgroundColor: ep.organDonor ? '#dcfce7' : '#f1f5f9',
                  color: ep.organDonor ? '#166534' : '#475569',
                  fontWeight: 'bold'
                }}>
                  {ep.organDonor ? 'SÍ' : 'NO'}
                </span>
              </div>
              <div>
                <p className="form-label" style={{ color: 'var(--emergency-text)' }}>Acepta Transfusiones</p>
                <span style={{ 
                  display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem', 
                  backgroundColor: ep.acceptsTransfusions ? '#dcfce7' : '#fee2e2',
                  color: ep.acceptsTransfusions ? '#166534' : '#991b1b',
                  fontWeight: 'bold'
                }}>
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
