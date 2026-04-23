import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getPatientByDni } from '../services/patientService';

const Dashboard = () => {
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!dni.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const patient = await getPatientByDni(dni);
      if (patient) {
        navigate(`/patient/${patient.id}`);
      } else {
        setError('No se encontró ningún paciente con ese DNI.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al buscar el paciente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container animate-fade-in" style={{ paddingTop: '3rem' }}>
        <h1 style={{ marginBottom: '2rem' }}>Panel Médico</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div className="card">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Search color="var(--primary)" />
              Buscar Paciente
            </h2>
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label className="form-label">DNI del Paciente</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ingrese el DNI"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                />
              </div>
              {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Buscando...' : 'Buscar Historial'}
              </button>
            </form>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '3rem 1.5rem' }}>
            <UserPlus size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Nuevo Paciente</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Registra un nuevo paciente en el sistema para comenzar su historial.
            </p>
            <button className="btn btn-outline" onClick={() => alert('Función de registro en desarrollo')} style={{ width: '100%' }}>
              Registrar Paciente
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
