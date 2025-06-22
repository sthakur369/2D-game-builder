import React, { useState, useEffect } from 'react';

export default function GenerationProgress({ requestId, onComplete, onError }) {
  const [progress, setProgress] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (!requestId) return;

    // Show initial loading state immediately
    setProgress({
      step: 'initializing',
      status: 'running',
      message: 'Starting game generation...',
      progress_percent: 0
    });

    const pollProgress = async () => {
      try {
        console.log("🔄 Polling progress for:", requestId);
        const response = await fetch(`http://localhost:8000/progress/${requestId}`);
        const data = await response.json();
        
        console.log("📊 Progress data:", data);
        
        if (data.status === 'not_found') {
          console.log("❌ Progress not found, retrying...");
          // Retry after a short delay
          setTimeout(pollProgress, 1000);
          return;
        }

        setProgress(data);
        setProgressPercent(data.progress_percent || 0);
        setCurrentStep(data.message || '');

        // Track completed steps
        if (data.status === 'completed' && data.step !== 'complete') {
          setCompletedSteps(prev => {
            if (!prev.includes(data.message)) {
              return [...prev, data.message];
            }
            return prev;
          });
        }

        // Check if generation is complete
        if (data.step === 'complete' && data.status === 'completed') {
          console.log("🎉 Generation completed!");
          onComplete && onComplete(data);
          return;
        }

        // Check for errors
        if (data.status === 'error') {
          console.error("❌ Generation error:", data.message);
          onError && onError(data.message);
          return;
        }

        // Continue polling
        setTimeout(pollProgress, 1000);
      } catch (error) {
        console.error('Error polling progress:', error);
        // Retry after 2 seconds on error
        setTimeout(pollProgress, 2000);
      }
    };

    pollProgress();
  }, [requestId, onComplete, onError]);

  if (!progress) {
    return null;
  }

  const getStepIcon = (step) => {
    switch (step) {
      case 'blueprint': return '📋';
      case 'production_plan': return '📝';
      case 'assets': return '🎨';
      case 'phaser_files': return '⚡';
      case 'complete': return '✅';
      default: return '🔄';
    }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">🎮 Generating Your Game</h3>
          
          {/* Progress Circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercent / 100)}`}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-700">{Math.round(progressPercent)}%</span>
            </div>
          </div>

          {/* Current Step */}
          <div className="mb-6">
            <div className={`text-lg font-medium ${getStepColor(progress.status)}`}>
              {getStepIcon(progress.step)} {currentStep}
            </div>
          </div>

          {/* Completed Steps */}
          {completedSteps.length > 0 && (
            <div className="text-left">
              <h4 className="font-medium text-gray-700 mb-2">✅ Completed Steps:</h4>
              <ul className="space-y-1">
                {completedSteps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Status Message */}
          <p className="text-sm text-gray-500 mt-4">
            {progress.status === 'running' ? 'Please wait while we create your game...' : 
             progress.status === 'completed' ? 'Game generated successfully!' : 
             progress.status === 'error' ? 'An error occurred' : ''}
          </p>
        </div>
      </div>
    </div>
  );
} 