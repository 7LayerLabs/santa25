'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SnowEffect from '@/components/SnowEffect';
import { db, generateGameId } from '@/lib/instantdb';
import { tx, id } from '@instantdb/react';

type Step = 'count' | 'names' | 'exclusions' | 'creating';

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('count');
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [names, setNames] = useState<string[]>([]);
  const [exclusions, setExclusions] = useState<{ [key: string]: string[] }>({});
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [showCustomCount, setShowCustomCount] = useState(false);
  const [customCount, setCustomCount] = useState('');

  const handleCountSelect = (count: number) => {
    setParticipantCount(count);
    setNames(Array(count).fill(''));
    setStep('names');
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleNamesSubmit = () => {
    const trimmedNames = names.map(n => n.trim()).filter(n => n.length > 0);
    const uniqueNames = new Set(trimmedNames);

    if (trimmedNames.length < participantCount) {
      setError('Please fill in all names');
      return;
    }

    if (uniqueNames.size !== trimmedNames.length) {
      setError('All names must be unique');
      return;
    }

    if (!adminPassword.trim()) {
      setError('Please set an admin password');
      return;
    }

    setError('');
    setNames(trimmedNames);
    // Initialize empty exclusions for each person
    const initialExclusions: { [key: string]: string[] } = {};
    trimmedNames.forEach(name => {
      initialExclusions[name] = [];
    });
    setExclusions(initialExclusions);
    setStep('exclusions');
  };

  const toggleExclusion = (person: string, excluded: string) => {
    setExclusions(prev => {
      const current = prev[person] || [];
      const newExclusions = current.includes(excluded)
        ? current.filter(e => e !== excluded)
        : [...current, excluded];
      return { ...prev, [person]: newExclusions };
    });
  };

  const handleCreateGame = async () => {
    setStep('creating');

    try {
      const gameId = generateGameId();

      await db.transact(
        tx.games[id()].update({
          gameCode: gameId,
          names: names,
          exclusions: exclusions,
          adminPassword: adminPassword.trim(),
          createdAt: Date.now(),
        })
      );

      // Small delay for effect
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push(`/game/${gameId}`);
    } catch (err) {
      console.error('Failed to create game:', err);
      setError('Failed to create game. Please try again.');
      setStep('exclusions');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d0f0f] to-[#0f1a0f] relative">
      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-900/20 rounded-full blur-3xl" />

      <SnowEffect />

      {/* Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center pt-8 pb-4 px-4"
      >
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-4xl">🎄</span>
          <h1 className="font-christmas text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-red-600 drop-shadow-lg pt-4 pb-2">
            Secret Santa
          </h1>
          <span className="text-4xl">🎄</span>
        </div>
        <p className="text-green-400/80 text-xl md:text-2xl font-bold">
          Create your gift exchange in seconds!
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Select participant count */}
          {step === 'count' && (
            <motion.div
              key="count"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/80 backdrop-blur rounded-2xl p-8 max-w-lg w-full border border-gray-700"
            >
              <div className="text-center mb-6">
                <span className="text-5xl">👥</span>
                <h2 className="font-christmas text-3xl text-white mt-4">How many participants?</h2>
                <p className="text-gray-400 mt-2">Select the number of people joining</p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleCountSelect(count)}
                    className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold text-xl transition-all border border-white/20 hover:border-yellow-400 hover:scale-105"
                  >
                    {count}
                  </button>
                ))}
                {!showCustomCount ? (
                  <button
                    onClick={() => setShowCustomCount(true)}
                    className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold text-lg transition-all border border-white/20 hover:border-yellow-400 hover:scale-105"
                  >
                    Other
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="3"
                      max="100"
                      value={customCount}
                      onChange={(e) => setCustomCount(e.target.value)}
                      placeholder="#"
                      autoFocus
                      className="w-16 bg-gray-800 text-white px-2 py-2 rounded-lg border border-yellow-400 focus:outline-none text-center text-xl font-bold"
                    />
                    <button
                      onClick={() => {
                        const num = parseInt(customCount);
                        if (num >= 3 && num <= 100) {
                          handleCountSelect(num);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-500 text-white px-3 rounded-lg font-bold"
                    >
                      Go
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Enter names */}
          {step === 'names' && (
            <motion.div
              key="names"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/80 backdrop-blur rounded-2xl p-8 max-w-lg w-full border border-gray-700"
            >
              <div className="text-center mb-6">
                <span className="text-5xl">📝</span>
                <h2 className="font-christmas text-3xl text-white mt-4">Enter Names</h2>
                <p className="text-gray-400 mt-2">Who's participating in the gift exchange?</p>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-2">
                {names.map((name, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-gray-500 w-6 text-right">{index + 1}.</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`Person ${index + 1}`}
                      className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 mb-4">
                <label className="text-gray-300 text-sm block mb-2">Admin Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Set a password to manage this game"
                  className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none"
                />
                <p className="text-gray-500 text-xs mt-1">You'll need this to view picks or reset the game</p>
              </div>

              {error && (
                <p className="text-red-400 text-center mb-4">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('count')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNamesSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-xl font-bold transition-all"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Set exclusions */}
          {step === 'exclusions' && (
            <motion.div
              key="exclusions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900/80 backdrop-blur rounded-2xl p-8 max-w-2xl w-full border border-gray-700"
            >
              <div className="text-center mb-6">
                <span className="text-5xl">🚫</span>
                <h2 className="font-christmas text-3xl text-white mt-4">Exclusion Rules</h2>
                <p className="text-gray-400 mt-2">Optional: Select who can't pick whom (e.g., couples)</p>
              </div>

              <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2">
                {names.map((person) => (
                  <div key={person} className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-white font-bold mb-2">{person} can't pick:</p>
                    <div className="flex flex-wrap gap-2">
                      {names.filter(n => n !== person).map((other) => {
                        const isExcluded = exclusions[person]?.includes(other);
                        return (
                          <button
                            key={other}
                            onClick={() => toggleExclusion(person, other)}
                            className={`px-3 py-1 rounded-full text-sm transition-all ${
                              isExcluded
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {other}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-center mb-4">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('names')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateGame}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3 rounded-xl font-christmas text-xl transition-all"
                >
                  Create Game 🎁
                </button>
              </div>
            </motion.div>
          )}

          {/* Creating state */}
          {step === 'creating' && (
            <motion.div
              key="creating"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-8xl mb-6"
              >
                🎁
              </motion.div>
              <p className="text-white font-christmas text-3xl">Creating your game...</p>
              <p className="text-green-400 mt-2">Santa is preparing the sack!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative elements */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute bottom-8 left-8 text-5xl opacity-70"
      >
        🎄
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        className="absolute bottom-12 right-8 text-4xl opacity-70"
      >
        🦌
      </motion.div>
    </main>
  );
}
