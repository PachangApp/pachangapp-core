import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';

const CaptchaGrid = ({ onSuccess }) => {
  const [targetPositions, setTargetPositions] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

  const generatePositions = () => {
    const positions = new Set();
    while (positions.size < 3) {
      positions.add(Math.floor(Math.random() * 9));
    }
    return Array.from(positions);
  };

  const resetCaptcha = () => {
    setTargetPositions(generatePositions());
    setSelectedPositions([]);
    setStatus('idle');
  };

  useEffect(() => {
    resetCaptcha();
  }, []);

  const handleSquareClick = async (index) => {
    if (status === 'success' || status === 'loading') return;
    
    // Toggle selection
    if (selectedPositions.includes(index)) {
        setSelectedPositions(selectedPositions.filter(i => i !== index));
        return;
    }

    const newSelected = [...selectedPositions, index];
    setSelectedPositions(newSelected);

    if (newSelected.length === 3) {
      setStatus('loading');
      try {
        const response = await fetch(`${API_BASE_URL}/captcha/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedPositions: newSelected,
            targetPositions: targetPositions
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStatus('success');
            if (onSuccess) onSuccess();
          } else {
            handleError();
          }
        } else {
          handleError();
        }
      } catch (error) {
        console.error("Error verifying CAPTCHA:", error);
        handleError();
      }
    }
  };

  const handleError = () => {
    setStatus('error');
    setTimeout(() => {
      resetCaptcha();
    }, 800); // 0.8 second error state before reset
  };

  return (
    <div className={`w-full max-w-[240px] mx-auto mb-4 p-3 rounded-xl border transition-all duration-300
      ${status === 'success' ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 bg-gray-50'}
      ${status === 'error' ? 'animate-[shake_0.4s_ease-in-out_2] border-red-400 bg-red-50' : ''}
    `}>
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}
      </style>
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-semibold text-gray-700">
          {status === 'success' ? '¡Verificado!' : 'Selecciona los 3 balones'}
        </p>
        {status !== 'success' && (
          <button 
            type="button" 
            onClick={resetCaptcha}
            className="text-xs text-emerald-600 hover:text-emerald-700 underline font-medium"
          >
            Regenerar
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 relative">
        {[...Array(9)].map((_, i) => {
          const isSelected = selectedPositions.includes(i);
          const hasBall = targetPositions.includes(i);
          
          return (
            <div
              key={i}
              onClick={() => handleSquareClick(i)}
              className={`
                aspect-square rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden
                transition-all duration-200 ease-in-out border-2
                ${isSelected 
                  ? (status === 'error' ? 'border-red-500 bg-red-100 scale-95 shadow-inner' : 'border-emerald-500 bg-emerald-100 scale-95 shadow-inner')
                  : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md hover:scale-[1.02]'}
                ${status === 'success' ? 'cursor-default opacity-90' : ''}
              `}
            >
              {hasBall && (
                <svg 
                  className={`w-8 h-8 transition-transform duration-300 ${isSelected ? (status === 'error' ? 'text-red-600' : 'text-emerald-600 scale-110') : 'text-gray-600 hover:text-emerald-500'}`} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  {/* Pentágono central */}
                  <path d="M12 7l3 4-1.5 4h-3l-1.5-4z" />
                  {/* Líneas radiantes */}
                  <path d="M12 7V2" />
                  <path d="M15 11l4.5-2" />
                  <path d="M13.5 15l2 4" />
                  <path d="M10.5 15l-2 4" />
                  <path d="M9 11L4.5 9" />
                </svg>
              )}
              
              {/* Success Checkmark Overlay */}
              {isSelected && status === 'success' && hasBall && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-100/40 rounded-lg backdrop-blur-[1px]">
                  <svg className="w-10 h-10 text-emerald-500 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {status === 'loading' && (
        <div className="mt-3 text-center text-xs text-gray-500 animate-pulse font-medium">
          Verificando...
        </div>
      )}
    </div>
  );
};

export default CaptchaGrid;
