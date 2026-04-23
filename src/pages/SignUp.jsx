import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { registerPublicPatient } from '../services/authService';

const SignUp = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    fechaNacimiento: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerPublicPatient(formData);
      navigate('/my-profile');
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-6">
      <div className="card max-w-lg w-full animate-fade-in">
        <div className="flex flex-col items-center mb-6 text-primary">
          <Shield className="w-12 h-12 mb-2" />
          <h2 className="text-2xl font-bold">Registro de Pacientes</h2>
          <p className="text-slate-500 text-center">Crea tu cuenta para gestionar tu perfil de emergencia y ver tu historial médico.</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group">
            <label className="form-label">DNI / ID</label>
            <input required type="text" name="dni" value={formData.dni} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group md:col-span-2">
            <label className="form-label">Fecha de Nacimiento</label>
            <input required type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group md:col-span-2">
            <label className="form-label">Correo Electrónico</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
          </div>
          <div className="form-group md:col-span-2">
            <label className="form-label">Contraseña</label>
            <input required type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" minLength="6" />
          </div>
          <div className="md:col-span-2 mt-4">
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm text-text-secondary">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline font-medium">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
