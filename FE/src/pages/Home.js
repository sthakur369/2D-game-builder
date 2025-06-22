import React, { useState, useEffect } from 'react';
import GameCard from '../components/GameCard';
import PromptForm from '../components/PromptForm';

const dummyGames = [
  {
    id: 'dbz_showdown',
    title: 'Dragon Ball Z: Ultimate Showdown',
    genre: 'Fighting',
    description: 'Fast-paced anime-style fighter',
    thumbnail: '/assets/placeholder.png',
  },
  {
    id: 'mario_dash',
    title: 'Super Mario Pizza Dash',
    genre: 'Platformer',
    description: 'Side-scroll platformer inspired by Mario',
    thumbnail: '/assets/placeholder.png',
  },
];


export default function Home() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/games")
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(err => console.error("Error loading games:", err));
  }, []);

  const handleDelete = (id) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ...header and layout same */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        <section className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">🪄 Describe your game idea</h2>
          <PromptForm setGames={setGames} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">🗂️ Your Games</h2>
          {games.length === 0 ? (
            <p className="text-gray-500">No games yet. Start by describing one above.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
