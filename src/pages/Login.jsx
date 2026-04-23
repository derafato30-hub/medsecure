import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { loginUser } from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { role } = await loginUser(email, password);
      if (role === 'doctor') {
        navigate('/');
      } else if (role === 'patient') {
        navigate('/my-profile');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-6">
      <div className="card max-w-md w-full text-center animate-fade-in">
        <div className="flex justify-center mb-6 text-primary">
          <Shield className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Acceso a MedSecure</h2>
        <p className="text-slate-500 mb-8">
          Ingresa tus credenciales para acceder a la plataforma
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 text-sm text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="text-left">
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="usuario@hospital.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
