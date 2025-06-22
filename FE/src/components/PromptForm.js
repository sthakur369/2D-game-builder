import React, { useState } from 'react';
import SuccessModal from './SuccessModal';

export default function PromptForm({ setGames }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [generatedGame, setGeneratedGame] = useState(null);
  const [is3D, setIs3D] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🔥 Button clicked, form submitted");
    
    if (!prompt) {
      console.log("❌ No prompt provided");
      return;
    }
    
    console.log("📝 Prompt:", prompt);
    setLoading(true);
    setShowSuccess(false);
    setCompletedSteps([]);
    setGeneratedGame(null);
  
    try {
      console.log("🌐 Making API request to http://127.0.0.1:8000/generate");
      
      const res = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      
      console.log("📡 Response status:", res.status);
      console.log("📡 Response ok:", res.ok);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      console.log("✅ Response data:", data);
      
      // Get the request ID and start polling for completion
      const requestId = data.request_id;
      console.log("🆔 Got request ID:", requestId);
      
      // Poll for completion
      const pollForCompletion = async () => {
        try {
          const progressRes = await fetch(`http://localhost:8000/progress/${requestId}`);
          const progressData = await progressRes.json();
          
          console.log("📊 Progress data:", progressData);
          
          if (progressData.status === 'completed' && progressData.step === 'complete') {
            // Generation completed!
            console.log("🎉 Generation completed!");
            
            // Create a basic game object for the success modal
            const newGame = {
              id: 'game_' + Date.now(),
              title: prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt,
              genre: 'Action',
              description: prompt,
              thumbnail: '/assets/placeholder.png',
            };
            
            setGeneratedGame(newGame);
            setLoading(false);
            
            // Show success modal
            setCompletedSteps([
              "Game blueprint generated",
              "Production plan created", 
              "Assets generated",
              "Phaser files created",
              "Game ready to play!"
            ]);
            setShowSuccess(true);
            return;
          } else if (progressData.status === 'error') {
            throw new Error(progressData.message || 'Generation failed');
          }
          
          // Continue polling
          setTimeout(pollForCompletion, 2000);
        } catch (error) {
          console.error("❌ Polling error:", error);
          alert(`Generation failed: ${error.message}`);
          setLoading(false);
        }
      };
      
      // Start polling
      pollForCompletion();
      
    } catch (err) {
      console.error("❌ Detailed Error:", err);
      console.error("❌ Error message:", err.message);
      console.error("❌ Error stack:", err.stack);
      alert(`Something went wrong: ${err.message}`);
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccess(false);
    setPrompt('');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center mb-2">
          <span className="mr-2 font-medium text-gray-700">Game Type:</span>
          <button
            type="button"
            className={`px-4 py-1 rounded-full border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${is3D ? 'bg-purple-600 text-white border-purple-600' : 'bg-blue-100 text-blue-700 border-blue-400'}`}
            onClick={() => setIs3D((prev) => !prev)}
            aria-pressed={is3D}
          >
            {is3D ? '3D' : '2D'}
          </button>
        </div>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows="3"
          placeholder="e.g., A 2D fighting game like Dragon Ball Z with energy blasts and flying combat..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
            onClick={() => console.log("🖱️ Button clicked directly")}
          >
            {loading ? "Generating..." : "🎮 Generate Game"}
          </button>
          
          {loading && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </form>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessModalClose}
        stepsCompleted={completedSteps}
        gameData={generatedGame}
      />
    </>
  );
}