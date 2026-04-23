import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getPatientByDni } from '../services/patientService';
import PatientRegistration from '../components/PatientRegistration';

const Dashboard = () => {
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
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
      <div className="container animate-fade-in py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel Médico</h1>
          <button 
            onClick={() => setShowRegistration(!showRegistration)} 
            className={`btn ${showRegistration ? 'btn-outline' : 'btn-primary'}`}
          >
            {showRegistration ? 'Ocultar Registro' : 'Registrar Nuevo Paciente'}
          </button>
        </div>
        
        {showRegistration && (
          <div className="mb-8 animate-fade-in">
            <PatientRegistration onRegistered={() => setShowRegistration(false)} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="card">
            <h2 className="flex items-center gap-2 text-xl font-bold mb-6 text-primary">
              <Search className="w-6 h-6" /> Buscar Paciente
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
              {error && <p className="text-danger text-sm mb-4">{error}</p>}
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar Historial'}
              </button>
            </form>
          </div>

          <div className="card flex flex-col justify-center items-center text-center p-8">
            <UserPlus className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Acceso Rápido</h3>
            <p className="text-text-secondary mb-6">
              Busca a un paciente existente con su DNI para añadir registros inmutables, o registra a un paciente nuevo en el sistema para habilitar su acceso.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
