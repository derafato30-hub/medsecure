import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';

const Navbar = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="bg-surface border-b border-border py-4 sticky top-0 z-[100]">
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Shield className="w-6 h-6" />
          MedSecure
        </Link>
        
        {currentUser && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary flex items-center gap-2">
              <User className="w-4 h-4" />
              {userRole === 'doctor' ? 'Dr. ' : ''}{currentUser.email}
            </span>
            <Link to="/settings" className="btn btn-outline border-transparent text-text-secondary hover:text-primary py-2 px-3" title="Configuración">
              <Settings className="w-4 h-4" />
            </Link>
            <button className="btn btn-outline py-2 px-4 text-sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
