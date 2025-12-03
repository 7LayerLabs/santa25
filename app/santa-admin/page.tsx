'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
      localStorage.removeItem('secret-santa-pick');
      localStorage.removeItem('secret-santa-picker-name');
      setMessage('Your pick has been cleared! Refresh the main page.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

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
              🔓 Enter Workshop
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
              ← Back to Game
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
          <h2 className="text-white text-xl mb-4 font-christmas">🛠️ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={clearMyPick}
              className="bg-yellow-600 hover:bg-yellow-500 text-white py-3 px-4 rounded-lg transition-colors"
            >
              🗑️ Clear My Pick (This Browser)
            </button>
            <button
              onClick={() => {
                if (confirm('This will open instructions for resetting all picks. Continue?')) {
                  setMessage('To reset ALL picks, you need to clear the Supabase database. See instructions below.');
                }
              }}
              className="bg-red-600 hover:bg-red-500 text-white py-3 px-4 rounded-lg transition-colors"
            >
              🔄 Reset All Picks (Database)
            </button>
          </div>
        </div>

        {/* Participant List */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl mb-4 font-christmas">👥 Participants ({FAMILY_NAMES.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {FAMILY_NAMES.map((name, i) => (
              <div
                key={i}
                className="bg-gray-700 text-white text-center py-2 px-3 rounded-lg text-sm"
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Exclusion Rules */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-white text-xl mb-4 font-christmas">💑 Exclusion Rules (Can't Pick Each Other)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(EXCLUSIONS)
              .filter(([key]) => key < EXCLUSIONS[key]) // Only show each pair once
              .map(([person1, person2]) => (
                <div
                  key={`${person1}-${person2}`}
                  className="bg-red-900/30 border border-red-700 text-white text-center py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <span>{person1}</span>
                  <span className="text-red-400">↔️</span>
                  <span>{person2}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-white text-xl mb-4 font-christmas">📋 How It Works</h2>
          <div className="text-gray-300 space-y-3 text-sm">
            <p>
              <strong className="text-green-400">For Participants:</strong> Each person visits the site, selects their name, and clicks a gift to draw.
              They can NEVER pick their spouse/partner. Their pick is saved so they can't pick again.
            </p>
            <p>
              <strong className="text-yellow-400">For You (Admin):</strong> Only you can access this page with the password.
              You can clear individual picks or reset the entire game.
            </p>
            <p>
              <strong className="text-red-400">To Reset Everything:</strong> When using Supabase, run this SQL:
            </p>
            <code className="block bg-gray-900 p-3 rounded text-green-400 text-xs">
              UPDATE participants SET is_taken = false, ticket_number = null;
            </code>
            <p className="text-gray-500 text-xs mt-4">
              Note: Currently running in demo mode (localStorage only).
              Connect to Supabase for full multi-device sync.
            </p>
          </div>
        </div>

        {/* Password reminder */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Admin password: <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400">{ADMIN_PASSWORD}</code>
          </p>
          <p className="text-gray-600 text-xs mt-1">
            (Change this in the code before deploying!)
          </p>
        </div>
      </div>
    </div>
  );
}
