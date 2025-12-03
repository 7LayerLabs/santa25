'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/instantdb';
import { tx } from '@instantdb/react';

// Change this password to whatever you want!
const ADMIN_PASSWORD = 'hohoho2024';

const FAMILY_NAMES = [
  "Derek", "Ali", "Mom", "John", "Heidi",
  "Rick", "Heather", "Ken", "Kim", "Gene"
];

// Exclusion pairs - these people cannot pick each other
const EXCLUSIONS: { [key: string]: string } = {
  "Derek": "Ali",
  "Ali": "Derek",
  "Mom": "John",
  "John": "Mom",
  "Heidi": "Rick",
  "Rick": "Heidi",
  "Kim": "Gene",
  "Gene": "Kim",
  "Ken": "Heather",
  "Heather": "Ken"
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Query InstantDB for real-time picks data
  const { isLoading: dbLoading, data } = db.useQuery({ picks: {} });
  const picks = data?.picks || [];

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('santa-admin-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('santa-admin-auth', 'true');
      setError('');
    } else {
      setError('Wrong password! Santa is watching... 🎅');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('santa-admin-auth');
  };

  const clearMyPick = () => {
    if (confirm('Clear your own pick from this browser?')) {
      localStorage.removeItem('secret-santa-my-pick');
      localStorage.removeItem('secret-santa-picker-name');
      setMessage('Your local pick has been cleared! Refresh the main page.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const resetAllPicks = async () => {
    if (confirm('Are you sure you want to reset ALL picks? This cannot be undone!')) {
      if (confirm('Really? Everyone will need to pick again!')) {
        try {
          // Delete all picks from InstantDB
          const deleteTransactions = picks.map((pick: any) =>
            tx.picks[pick.id].delete()
          );

          if (deleteTransactions.length > 0) {
            await db.transact(deleteTransactions);
          }

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

  // Calculate who has picked and who hasn't
  const pickerNames = new Set(picks.map((p: any) => p.pickerName));
  const notYetPicked = FAMILY_NAMES.filter(name => !pickerNames.has(name));

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
              <label className="text-gray-300 text-sm block mb-2">Secret Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the magic word..."
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

          <p className="text-center text-gray-500 text-xs mt-6">
            Only Santa (Derek) knows the password!
          </p>
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
          <p className="text-gray-400">Manage the Secret Santa game</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="/" className="text-green-400 hover:text-green-300 underline">
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

        {/* Current Picks - ADMIN VIEW */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl mb-4 font-christmas">Current Picks ({picks.length}/{FAMILY_NAMES.length})</h2>
          {dbLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : picks.length === 0 ? (
            <p className="text-gray-400">No picks yet. The game is ready to start!</p>
          ) : (
            <div className="space-y-2">
              {picks.map((pick: any) => (
                <div
                  key={pick.id}
                  className="bg-gray-700 rounded-lg px-4 py-3 flex justify-between items-center"
                >
                  <div>
                    <span className="text-white font-medium">{pick.pickerName}</span>
                    <span className="text-gray-400 mx-2">drew</span>
                    <span className="text-green-400 font-medium">{pick.recipientName}</span>
                  </div>
                  <span className="text-gray-500 text-sm">Gift #{pick.ticketNumber}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Who Hasn't Picked Yet */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl mb-4 font-christmas">Still Need to Pick ({notYetPicked.length})</h2>
          {notYetPicked.length === 0 ? (
            <p className="text-green-400">Everyone has picked! Merry Christmas!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
          <h2 className="text-white text-xl mb-4 font-christmas">Participants ({FAMILY_NAMES.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {FAMILY_NAMES.map((name, i) => (
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
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl mb-4 font-christmas">Exclusion Rules (Can't Pick Each Other)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(EXCLUSIONS)
              .filter(([key]) => key < EXCLUSIONS[key]) // Only show each pair once
              .map(([person1, person2]) => (
                <div
                  key={`${person1}-${person2}`}
                  className="bg-red-900/30 border border-red-700 text-white text-center py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <span>{person1}</span>
                  <span className="text-red-400">cannot pick</span>
                  <span>{person2}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Password reminder */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Admin password: <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400">{ADMIN_PASSWORD}</code>
          </p>
          <p className="text-gray-600 text-xs mt-1">
            (Change this in the code before sharing!)
          </p>
        </div>
      </div>
    </div>
  );
}
