import React, { useState } from 'react';
import ModifyGameModal from './ModifyGameModal';

export default function GameCard({ game, onDelete }) {
  const [showModify, setShowModify] = useState(false);

  const handlePlay = () => {
    // Open the game's Phaser index.html in a new tab (assuming backend serves static files)
    window.open(`http://localhost:8000/games/${game.id}/phaser/index.html`, '_blank');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${game.title}?`)) return;
    try {
      const res = await fetch(`http://localhost:8000/delete/${game.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (onDelete) onDelete(game.id);
      } else {
        alert('Failed to delete game.');
      }
    } catch (err) {
      alert('Error deleting game: ' + err.message);
    }
  };

  const handleModify = () => {
    setShowModify(true);
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-200">
      <img
        src={game.thumbnail}
        alt={game.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4 space-y-2">
      <h3 className="text-lg font-bold text-gray-800">{game.title}</h3>
<p className="text-sm text-blue-500">{game.genre}</p>
<p className="text-sm text-gray-600">{game.description}</p>

        <div className="mt-3 flex justify-between text-sm">
          <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" onClick={handlePlay}>▶ Play</button>
          <button className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600" onClick={handleModify}>✏ Modify</button>
          <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={handleDelete}>❌ Delete</button>
        </div>
      </div>
      {showModify && <ModifyGameModal gameId={game.id} onClose={() => setShowModify(false)} />}
    </div>
  );
}
