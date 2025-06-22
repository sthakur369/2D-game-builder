import React, { useEffect, useState } from 'react';

export default function ModifyGameModal({ gameId, onClose }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch asset folders from backend
  useEffect(() => {
    async function fetchFolders() {
      try {
        const res = await fetch(`http://localhost:8000/asset_folders/${gameId}`);
        const data = await res.json();
        setFolders(data);
        if (data.length > 0) setSelectedFolder(data[0]);
      } catch (err) {
        setStatus('Failed to load asset folders.');
      }
    }
    fetchFolders();
  }, [gameId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/modify_asset/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: selectedFolder, description }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('✅ Asset replaced! Please reload the game to see changes.');
      } else {
        setStatus('❌ ' + (data.detail || 'Failed to modify asset.'));
      }
    } catch (err) {
      setStatus('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={onClose}>✖</button>
        <h2 className="text-xl font-bold mb-4">Modify Game Asset</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Asset Type</label>
            <select
              className="w-full border rounded p-2"
              value={selectedFolder}
              onChange={e => setSelectedFolder(e.target.value)}
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the new asset (e.g., 'A night-time desert background with stars')"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || !selectedFolder || !description}
          >
            {loading ? 'Generating...' : 'Generate & Replace'}
          </button>
        </form>
        {status && <div className="mt-4 text-center text-sm">{status}</div>}
      </div>
    </div>
  );
} 