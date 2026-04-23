import React, { useState } from 'react';
import { Settings, Lock, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';
import { changeUserPassword } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const AccountSettings = () => {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return Swal.fire('Error', 'Las nuevas contraseñas no coinciden', 'error');
    }

    if (newPassword.length < 6) {
      return Swal.fire('Error', 'La nueva contraseña debe tener al menos 6 caracteres', 'error');
    }

    setLoading(true);
    try {
      await changeUserPassword(currentPassword, newPassword);
      Swal.fire('Éxito', 'Contraseña actualizada correctamente', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') {
        Swal.fire('Error', 'La contraseña actual es incorrecta', 'error');
      } else {
        Swal.fire('Error', error.message || 'No se pudo actualizar la contraseña', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="container py-12 animate-fade-in max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Settings className="text-primary w-8 h-8" /> Configuración de Cuenta
        </h1>

        <div className="card">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Lock className="text-slate-500 w-5 h-5" /> Cambiar Contraseña
          </h2>
          
          <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-md mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              Para cambiar tu contraseña, necesitas ingresar tu contraseña actual por motivos de seguridad.
              <br/><br/>
              <strong>Cuenta activa:</strong> {currentUser?.email}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="form-label">Contraseña Actual</label>
              <input
                required
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-control"
                placeholder="Ingresa tu contraseña actual"
              />
            </div>
            
            <div className="pt-2 border-t border-slate-100">
              <label className="form-label">Nueva Contraseña</label>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-control mb-4"
                placeholder="Al menos 6 caracteres"
                minLength="6"
              />
            </div>

            <div>
              <label className="form-label">Confirmar Nueva Contraseña</label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
                placeholder="Repite tu nueva contraseña"
                minLength="6"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary mt-4 w-full sm:w-auto self-start">
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
