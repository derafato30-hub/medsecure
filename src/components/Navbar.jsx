import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, LogOut, User } from 'lucide-react';
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
    <nav style={{
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)' }}>
          <Shield size={24} />
          MedSecure
        </Link>
        
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} />
              {userRole === 'doctor' ? 'Dr. ' : ''}{currentUser.email}
            </span>
            <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <LogOut size={16} />
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
