import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Stethoscope } from 'lucide-react';
import Navbar from '../components/Navbar';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { registerDoctor } from '../services/authService';
import Swal from 'sweetalert2';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    colegiatura: '',
    especialidad: '',
    universidad: '',
    centroTrabajo: '',
    email: '',
    password: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'doctors_directory'));
      setDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching doctors", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Usar el servicio de registro silencioso (REST API)
      await registerDoctor(formData);
      
      Swal.fire('Éxito', 'Doctor registrado exitosamente con credenciales de acceso', 'success');
      setFormData({ 
        nombre: '', 
        colegiatura: '', 
        especialidad: '', 
        universidad: '', 
        centroTrabajo: '',
        email: '',
        password: '' 
      });
      fetchDoctors();
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo registrar al doctor', 'error');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="container py-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <UserCheck className="text-primary w-8 h-8" /> Panel de Administración Institucional
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Doctor Form */}
          <div className="card lg:col-span-1 h-fit">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Stethoscope className="text-primary" /> Nuevo Registro Médico
            </h2>
            <form onSubmit={handleAddDoctor} className="flex flex-col gap-4">
              <div>
                <label className="form-label">Nombre del Doctor</label>
                <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="form-control" />
              </div>
              <div>
                <label className="form-label">Nº de Colegiación (CMH)</label>
                <input required type="text" name="colegiatura" value={formData.colegiatura} onChange={handleChange} className="form-control" />
              </div>
              <div>
                <label className="form-label">Especialidad</label>
                <input required type="text" name="especialidad" value={formData.especialidad} onChange={handleChange} className="form-control" />
              </div>
              <div>
                <label className="form-label">Universidad de Egreso</label>
                <input required type="text" name="universidad" value={formData.universidad} onChange={handleChange} className="form-control" />
              </div>
              <div>
                <label className="form-label">Centro de Trabajo Actual</label>
                <input required type="text" name="centroTrabajo" value={formData.centroTrabajo} onChange={handleChange} className="form-control" />
              </div>

              <div className="border-t pt-4 mt-2">
                <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Credenciales de Acceso</h3>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="form-label text-xs">Email Institucional</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" placeholder="ejemplo@medsecure.com" />
                  </div>
                  <div>
                    <label className="form-label text-xs">Contraseña Temporal</label>
                    <input required type="password" name="password" value={formData.password} onChange={handleChange} className="form-control" placeholder="Min. 6 caracteres" />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary mt-2">
                {saving ? 'Registrando...' : 'Registrar en Directorio'}
              </button>
            </form>
          </div>

          {/* Directory List */}
          <div className="card lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="text-primary" /> Directorio de Doctores Verificados
            </h2>
            
            {loading ? <Loader /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-secondary">
                      <th className="py-3 font-semibold">Doctor</th>
                      <th className="py-3 font-semibold">Colegiación</th>
                      <th className="py-3 font-semibold">Especialidad</th>
                      <th className="py-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map(doc => (
                      <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 font-medium">{doc.nombre}</td>
                        <td className="py-4">{doc.colegiatura}</td>
                        <td className="py-4 text-text-secondary">{doc.especialidad}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${doc.estadoLicencia === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {doc.estadoLicencia}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {doctors.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-text-secondary">
                          No hay doctores registrados en el directorio.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
