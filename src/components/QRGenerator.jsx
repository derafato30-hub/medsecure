import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRGenerator = ({ dni }) => {
  const url = `${window.location.origin}/emergency/${dni}`;

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl border border-border w-full">
      <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
        <QRCodeSVG value={url} size={180} level="H" includeMargin={true} />
      </div>
      <p className="text-sm text-text-secondary text-center font-medium">
        Escanea en caso de emergencia
      </p>
    </div>
  );
};

export default QRGenerator;
