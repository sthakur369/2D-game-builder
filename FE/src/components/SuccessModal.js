import React from 'react';

export default function SuccessModal({ isOpen, onClose, stepsCompleted, gameData }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 shadow-xl">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">🎮 Game Generated Successfully!</h3>
          <p className="text-gray-600 mb-6">Your game is ready to play!</p>

          {/* Completed Steps */}
          <div className="text-left mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">✅ What we accomplished:</h4>
            <ul className="space-y-2">
              {stepsCompleted && stepsCompleted.map((step, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-3">✓</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Game Info */}
          {gameData && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Your Game Details:</h4>
              <div className="text-sm text-blue-700">
                <p><strong>Title:</strong> {gameData.title || 'Custom Game'}</p>
                <p><strong>Genre:</strong> {gameData.genre || 'Action'}</p>
                <p><strong>Description:</strong> {gameData.description || 'A fun game created with AI!'}</p>
              </div>
            </div>
          )}

          {/* Simple Close Button */}
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it! 👍
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 