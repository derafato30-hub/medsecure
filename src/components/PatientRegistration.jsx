import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { UserPlus } from 'lucide-react';
import { registerPatientAsDoctor } from '../services/authService';

const PatientRegistration = ({ onRegistered }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    fechaNacimiento: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerPatientAsDoctor(formData);
      Swal.fire('Éxito', 'Paciente registrado y cuenta creada correctamente.', 'success');
      setFormData({ nombre: '', dni: '', fechaNacimiento: '', email: '', password: '' });
      if (onRegistered) onRegistered();
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo registrar al paciente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="flex items-center gap-2 text-xl font-bold mb-6 text-primary">
        <UserPlus className="w-6 h-6" /> Nuevo Paciente
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Nombre Completo</label>
          <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">DNI</label>
          <input required type="text" name="dni" value={formData.dni} onChange={handleChange} className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de Nacimiento</label>
          <input required type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="form-control" />
        </div>
        <div className="form-group">
          <label className="form-label">Correo (Login)</label>
          <input required type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
        </div>
        <div className="form-group md:col-span-2">
          <label className="form-label">Contraseña Temporal</label>
          <input required type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" minLength="6" />
        </div>
        <div className="md:col-span-2 mt-2">
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Registrando...' : 'Registrar y Crear Cuenta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientRegistration;
