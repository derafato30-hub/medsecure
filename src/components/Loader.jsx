import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen = false }) => {
  return (
    <div className={fullScreen ? "flex justify-center items-center h-screen w-screen bg-background" : "flex justify-center items-center p-8"}>
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );
};

export default Loader;
