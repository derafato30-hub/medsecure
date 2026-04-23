import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen = false }) => {
  const containerStyle = fullScreen ? {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--background)'
  } : {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem'
  };

  return (
    <div style={containerStyle}>
      <Loader2 size={40} color="var(--primary)" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
