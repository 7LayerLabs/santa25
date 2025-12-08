'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { db } from '@/lib/instantdb';
import { tx } from '@instantdb/react';

export default function AdminPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revealedPicks, setRevealedPicks] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Query InstantDB for game and picks data
  const { isLoading: dbLoading, data } = db.useQuery({
    games: { $: { where: { gameCode: gameId } } },
    picks: { $: { where: { gameId: gameId } } }
  });

  const game = data?.games?.[0];
  const picks = data?.picks || [];
  const names: string[] = game?.names || [];
  const exclusions: { [key: string]: string[] } = game?.exclusions || {};

  // Check if already authenticated for this game
  useEffect(() => {
    const auth = sessionStorage.getItem(`santa-admin-${gameId}`);
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, [gameId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (game && password === game.adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem(`santa-admin-${gameId}`, 'true');
      setError('');
    } else {
      setError('Wrong password! Santa is watching... 🎅');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(`santa-admin-${gameId}`);
  };

  const clearMyPick = () => {
    if (confirm('Clear your own pick from this browser?')) {
      localStorage.removeItem(`secret-santa-${gameId}-pick`);
      localStorage.removeItem(`secret-santa-${gameId}-picker`);
      setMessage('Your local pick has been cleared! Refresh the game page.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const resetAllPicks = async () => {
    if (confirm('Are you sure you want to reset ALL picks? This cannot be undone!')) {
      if (confirm('Really? Everyone will need to pick again!')) {
        try {
          // Delete all picks
          const deleteTransactions = picks.map((pick: any) =>
            tx.picks[pick.id].delete()
          );

          // Also clear assignments so new ones are generated
          const clearAssignments = tx.games[game.id].update({
            assignments: null
          });

          await db.transact([...deleteTransactions, clearAssignments]);

          localStorage.removeItem(`secret-santa-${gameId}-pick`);
          localStorage.removeItem(`secret-santa-${gameId}-picker`);

          setMessage('All picks have been reset! The game is ready to start fresh.');
          setTimeout(() => setMessage(''), 5000);
        } catch (err) {
          console.error('Failed to reset picks:', err);
          setMessage('Error resetting picks. Please try again.');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    }
  };

  const copyGameLink = async () => {
    const url = `${window.location.origin}/game/${gameId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate who has picked and who hasn't
  const pickerNames = new Set(picks.map((p: any) => p.pickerName));
  const notYetPicked = names.filter(name => !pickerNames.has(name));

  const toggleReveal = (pickId: string) => {
    setRevealedPicks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pickId)) {
        newSet.delete(pickId);
      } else {
        newSet.add(pickId);
      }
      return newSet;
    });
  };

  // Loading state
  if (dbLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🎄
          </motion.div>
          <p className="text-white font-christmas text-2xl">Loading...</p>
        </div>
      </div>
    );
  }

  // Game not found
  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🎅</span>
          <h1 className="text-white font-christmas text-3xl mb-2">Game Not Found</h1>
          <p className="text-gray-400 mb-4">This Secret Santa game doesn't exist.</p>
          <a href="/" className="text-green-400 hover:text-green-300 underline">
            Create a new game
          </a>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d0f0f] to-[#0f1a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900/90 rounded-2xl p-8 max-w-md w-full border border-red-800 shadow-2xl"
        >
          <div className="text-center mb-6">
            <span className="text-6xl">🎅</span>
            <h1 className="font-christmas text-3xl text-red-400 mt-4">Santa's Workshop</h1>
            <p className="text-gray-400 mt-2">Admin access required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm block mb-2">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the admin password..."
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                autoFocus
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3 rounded-lg font-christmas text-xl transition-all"
            >
              Enter Workshop
            </button>
          </form>

          <a
            href={`/game/${gameId}`}
            className="block text-center text-gray-500 text-sm mt-6 hover:text-gray-400"
          >
            Back to game
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🎅</span>
            <h1 className="text-4xl font-bold text-white">Santa's Control Panel</h1>
            <span className="text-4xl">🎄</span>
          </div>
          <p className="text-gray-400">Manage your Secret Santa game</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href={`/game/${gameId}`} className="text-green-400 hover:text-green-300 underline">
              Back to Game
            </a>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 underline"
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-600/20 border border-green-500 text-green-400 px-4 py-2 rounded-lg mb-6 text-center"
          >
            {message}
          </motion.div>
        )}

        {/* Share Link */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl mb-4 font-christmas">Share This Game</h2>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/game/${gameId}`}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
            />
            <button
              onClick={copyGameLink}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl mb-4 font-christmas">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={clearMyPick}
              className="bg-yellow-600 hover:bg-yellow-500 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Clear My Local Pick
            </button>
            <button
              onClick={resetAllPicks}
              className="bg-red-600 hover:bg-red-500 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Reset ALL Picks
            </button>
          </div>
        </div>

        {/* Current Picks */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl mb-4 font-christmas">Current Picks ({picks.length}/{names.length})</h2>
          {picks.length === 0 ? (
            <p className="text-gray-400">No picks yet. The game is ready to start!</p>
          ) : (
            <div className="space-y-2">
              {picks.map((pick: any) => {
                const isRevealed = revealedPicks.has(pick.id);
                return (
                  <div
                    key={pick.id}
                    className="bg-gray-700 rounded-lg px-4 py-3 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{pick.pickerName}</span>
                      <span className="text-gray-400">drew</span>
                      {isRevealed ? (
                        <span className="text-green-400 font-medium">{pick.recipientName}</span>
                      ) : (
                        <span className="text-gray-500 font-medium blur-sm select-none">
                          {pick.recipientName}
                        </span>
                      )}
                      <button
                        onClick={() => toggleReveal(pick.id)}
                        className="ml-2 text-gray-400 hover:text-white transition-colors p-1"
                        title={isRevealed ? "Hide name" : "Reveal name"}
                      >
                        {isRevealed ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <span className="text-gray-500 text-sm">Gift #{pick.ticketNumber}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Who Hasn't Picked Yet */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl mb-4 font-christmas">Still Need to Pick ({notYetPicked.length})</h2>
          {notYetPicked.length === 0 ? (
            <p className="text-green-400">Everyone has picked! Merry Christmas!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {notYetPicked.map((name) => (
                <div
                  key={name}
                  className="bg-yellow-900/50 border border-yellow-600 text-yellow-400 text-center py-2 px-3 rounded-lg text-sm"
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Participant List */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl mb-4 font-christmas">Participants ({names.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {names.map((name, i) => (
              <div
                key={i}
                className={`text-center py-2 px-3 rounded-lg text-sm ${
                  pickerNames.has(name)
                    ? 'bg-green-900/50 border border-green-600 text-green-400'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {name} {pickerNames.has(name) && '✓'}
              </div>
            ))}
          </div>
        </div>

        {/* Exclusion Rules */}
        {Object.values(exclusions).some(arr => arr.length > 0) && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-white text-xl mb-4 font-christmas">Exclusion Rules</h2>
            <div className="space-y-2">
              {Object.entries(exclusions)
                .filter(([_, excluded]) => excluded.length > 0)
                .map(([person, excluded]) => (
                  <div
                    key={person}
                    className="bg-red-900/30 border border-red-700 text-white py-2 px-3 rounded-lg text-sm flex items-center gap-2"
                  >
                    <span className="font-medium">{person}</span>
                    <span className="text-red-400">can't pick:</span>
                    <span>{excluded.join(', ')}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
