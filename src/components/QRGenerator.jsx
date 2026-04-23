import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRGenerator = ({ dni }) => {
  // Use window.location.origin to point to the production URL automatically
  const url = `${window.location.origin}/emergency/${dni}`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)'
    }}>
      <QRCodeSVG value={url} size={200} level="H" includeMargin={true} />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        Escanea este código en caso de emergencia
      </p>
    </div>
  );
};

export default QRGenerator;
