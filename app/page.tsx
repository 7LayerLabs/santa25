'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SnowEffect from '@/components/SnowEffect';
import SantaSack from '@/components/SantaSack';
import GiftTicket from '@/components/GiftTicket';
import RevealModal from '@/components/RevealModal';
import NaughtyWarning from '@/components/NaughtyWarning';
import { db } from '@/lib/instantdb';
import { tx, id } from '@instantdb/react';

// Your family names!
const FAMILY_NAMES = [
  "Derek", "Ali", "Mom", "John", "Heidi",
  "Rick", "Heather", "Ken", "Kim", "Gene"
];

// Exclusion rules - who can't pick whom
const EXCLUSIONS: { [key: string]: string[] } = {
  "Derek": ["Ali", "John"],
  "Ali": ["Derek"],
  "Mom": ["John"],
  "John": ["Mom"],
  "Heidi": ["Rick"],
  "Rick": ["Heidi"],
  "Kim": ["Gene"],
  "Gene": ["Kim"],
  "Ken": ["Heather"],
  "Heather": ["Ken"]
};

const LOCAL_PICK_KEY = 'secret-santa-my-pick';
const LOCAL_PICKER_KEY = 'secret-santa-picker-name';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [revealedName, setRevealedName] = useState('');
  const [revealedTicket, setRevealedTicket] = useState(0);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

  // Local state for this user
  const [myPick, setMyPick] = useState<{ pickerName: string; recipientName: string; ticketNumber: number } | null>(null);
  const [showNaughtyWarning, setShowNaughtyWarning] = useState(false);
  const [showNamePicker, setShowNamePicker] = useState(false);
  const [pickerName, setPickerName] = useState<string | null>(null);

  // Query InstantDB for real-time picks data
  const { isLoading: dbLoading, error: dbError, data } = db.useQuery({ picks: {} });

  const picks = data?.picks || [];

  // Check localStorage for existing pick on mount
  useEffect(() => {
    const savedPick = localStorage.getItem(LOCAL_PICK_KEY);
    const savedPickerName = localStorage.getItem(LOCAL_PICKER_KEY);

    if (savedPick) {
      try {
        const parsed = JSON.parse(savedPick);
        setMyPick(parsed);
        setPickerName(parsed.pickerName);
      } catch (e) {
        console.error('Failed to parse saved pick:', e);
      }
    } else if (savedPickerName) {
      setPickerName(savedPickerName);
    }
  }, []);

  // Show name picker after database loads if no name selected
  useEffect(() => {
    if (!dbLoading && !pickerName && !myPick) {
      setShowNamePicker(true);
    }
  }, [dbLoading, pickerName, myPick]);

  // Check if local pick still exists in database - if not, clear local storage (game was reset)
  useEffect(() => {
    if (!dbLoading && myPick) {
      const stillExists = picks.some((p: any) =>
        p.pickerName === myPick.pickerName && p.recipientName === myPick.recipientName
      );

      if (!stillExists) {
        // This user's pick no longer exists in database - game was reset
        localStorage.removeItem(LOCAL_PICK_KEY);
        localStorage.removeItem(LOCAL_PICKER_KEY);
        setMyPick(null);
        setPickerName(null);
        setShowNamePicker(true);
      }
    }
  }, [dbLoading, picks, myPick]);

  // Calculate taken tickets and available names from real-time data
  const takenTickets = new Set(picks.map((p: any) => p.ticketNumber));
  const takenNames = new Set(picks.map((p: any) => p.recipientName));
  const availableNames = FAMILY_NAMES.filter(name => !takenNames.has(name));

  // Build ticket array
  const tickets = FAMILY_NAMES.map((_, i) => ({
    number: i + 1,
    isTaken: takenTickets.has(i + 1)
  }));

  const selectPickerName = (name: string) => {
    setPickerName(name);
    localStorage.setItem(LOCAL_PICKER_KEY, name);
    setShowNamePicker(false);
  };

  const handleTicketSelect = useCallback(async (ticketNumber: number) => {
    if (isLoading || dbLoading) return;

    // Check if user already picked
    if (myPick) {
      setShowNaughtyWarning(true);
      return;
    }

    // Check if user has identified themselves
    if (!pickerName) {
      setShowNamePicker(true);
      return;
    }

    // Check if this ticket is already taken (real-time check)
    if (takenTickets.has(ticketNumber)) {
      setError('This gift has already been claimed!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Check if this person already picked (from database)
    const alreadyPicked = picks.find((p: any) => p.pickerName === pickerName);
    if (alreadyPicked) {
      // Update local state with their existing pick
      const existingPick = {
        pickerName: alreadyPicked.pickerName,
        recipientName: alreadyPicked.recipientName,
        ticketNumber: alreadyPicked.ticketNumber
      };
      setMyPick(existingPick);
      localStorage.setItem(LOCAL_PICK_KEY, JSON.stringify(existingPick));
      setShowNaughtyWarning(true);
      return;
    }

    // Get available names excluding people they can't pick
    const excludedPeople = EXCLUSIONS[pickerName] || [];
    const validNames = availableNames.filter(name =>
      name !== pickerName && !excludedPeople.includes(name)
    );

    if (validNames.length === 0) {
      setError('No valid names available for you to pick!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSelectedTicket(ticketNumber);
    setIsShaking(true);
    setIsLoading(true);
    setError('');

    // Dramatic pause while "reaching into the sack"
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Pick a random name from valid names
    const randomIndex = Math.floor(Math.random() * validNames.length);
    const pickedName = validNames[randomIndex];

    // Save to InstantDB
    try {
      await db.transact(
        tx.picks[id()].update({
          pickerName: pickerName,
          recipientName: pickedName,
          ticketNumber: ticketNumber,
          timestamp: Date.now()
        })
      );

      // Save to localStorage
      const newPick = {
        pickerName: pickerName,
        recipientName: pickedName,
        ticketNumber: ticketNumber
      };
      localStorage.setItem(LOCAL_PICK_KEY, JSON.stringify(newPick));
      setMyPick(newPick);

      setRevealedName(pickedName);
      setRevealedTicket(ticketNumber);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to save pick:', err);
      setError('Failed to save your pick. Please try again!');
    }

    setIsShaking(false);
    setIsLoading(false);
    setSelectedTicket(null);
  }, [isLoading, dbLoading, myPick, pickerName, takenTickets, picks, availableNames]);

  const closeModal = () => {
    setShowModal(false);
    setRevealedName('');
  };

  const takenCount = tickets.filter(t => t.isTaken).length;
  const availableCount = tickets.filter(t => !t.isTaken).length;

  if (dbLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d0f0f] to-[#0f1a0f] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🎄
          </motion.div>
          <p className="text-white font-christmas text-2xl">Loading Santa's List...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d0f0f] to-[#0f1a0f] relative">
      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-900/20 rounded-full blur-3xl" />

      {/* Snow Effect */}
      <SnowEffect />

      {/* Wooden floor texture at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-950/50 to-transparent" />

      {/* Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center pt-8 pb-2 px-4 overflow-visible"
      >
        <div className="flex items-center justify-center gap-4 mb-2 overflow-visible">
          <span className="text-4xl">🎄</span>
          <h1 className="font-christmas text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-red-600 drop-shadow-lg pt-4 pb-2 overflow-visible">
            Secret Santa
          </h1>
          <span className="text-4xl">🎄</span>
        </div>
        <p className="text-green-400/80 text-2xl md:text-3xl font-christmas">
          Reach into Santa's sack and pick your gift!
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-4 pb-8">
        {/* Show who is picking */}
        {pickerName && !myPick && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/80 border border-blue-500 rounded-xl px-6 py-2 mb-4 text-center"
          >
            <p className="text-blue-300 text-sm">Picking as:</p>
            <p className="text-white font-christmas text-xl">{pickerName}</p>
            <button
              onClick={() => {
                localStorage.removeItem(LOCAL_PICKER_KEY);
                setPickerName(null);
              }}
              className="text-blue-400 text-xs hover:text-blue-300 underline mt-1"
            >
              Not you? Change name
            </button>
          </motion.div>
        )}

        {/* Show previous pick reminder if they already picked */}
        {myPick && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/80 border border-green-500 rounded-xl px-6 py-3 mb-4 text-center"
          >
            <p className="text-green-300 text-sm">{myPick.pickerName}, you already picked! Your person is:</p>
            <p className="text-white font-christmas text-2xl">{myPick.recipientName}</p>
            <p className="text-green-400/60 text-xs">(Gift #{myPick.ticketNumber})</p>
          </motion.div>
        )}

        {/* Santa's Sack */}
        <motion.div
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', duration: 1, delay: 0.3 }}
          className="mb-6"
        >
          <SantaSack
            isShaking={isShaking && !isLoading}
            isDrawing={isLoading}
            availableCount={availableCount}
          />
        </motion.div>

        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white/70 font-christmas text-xl md:text-2xl mb-4 text-center"
        >
          {isLoading ? (
            <span className="text-yellow-400 animate-pulse">🎁 Reaching into the sack... 🎁</span>
          ) : myPick ? (
            <span className="text-green-400">You've already picked! No peeking at others! 🤫</span>
          ) : !pickerName ? (
            <span className="text-yellow-400">Click a gift and tell us who you are!</span>
          ) : (
            'Pick a wrapped gift below to draw a name!'
          )}
        </motion.p>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-red-900/90 text-white px-6 py-3 rounded-xl mb-4 font-christmas text-lg shadow-lg border border-red-500"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gift Grid */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-5 gap-3 md:gap-4 max-w-lg mx-auto mb-6"
        >
          {tickets.map((ticket) => (
            <GiftTicket
              key={ticket.number}
              number={ticket.number}
              isTaken={ticket.isTaken}
              isSelected={selectedTicket === ticket.number}
              isLoading={isLoading}
              onClick={() => handleTicketSelect(ticket.number)}
            />
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-8 mb-6"
        >
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-2xl">🎁</span>
              <span className="text-green-400 text-3xl font-christmas">{availableCount}</span>
            </div>
            <div className="text-white/60 text-sm font-christmas">Gifts Left</div>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-2xl">📜</span>
              <span className="text-red-400 text-3xl font-christmas">{takenCount}</span>
            </div>
            <div className="text-white/60 text-sm font-christmas">Names Drawn</div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
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
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-32 left-8 text-3xl opacity-50"
        >
          🔔
        </motion.div>
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute top-40 right-8 text-3xl opacity-50"
        >
          ⭐
        </motion.div>
      </div>

      {/* Name Picker Modal */}
      <AnimatePresence>
        {showNamePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowNamePicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-b from-green-800 to-green-900 rounded-2xl p-6 max-w-md w-full border-4 border-yellow-500 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <span className="text-5xl">🎅</span>
                <h2 className="font-christmas text-3xl text-white mt-2">Who's Picking?</h2>
                <p className="text-green-300 text-sm mt-1">Select your name to continue</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {FAMILY_NAMES.map((name) => {
                  const hasPicked = picks.some((p: any) => p.pickerName === name);
                  return (
                    <button
                      key={name}
                      onClick={() => selectPickerName(name)}
                      disabled={hasPicked}
                      className={`py-4 px-4 rounded-xl font-bold text-xl transition-all border ${
                        hasPicked
                          ? 'bg-green-900/50 border-green-600 text-green-400 cursor-not-allowed'
                          : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-yellow-400'
                      }`}
                    >
                      {name} {hasPicked && '✓'}
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-green-300/60 text-xs mt-3">
                ✓ = Already picked
              </p>

              <button
                onClick={() => setShowNamePicker(false)}
                className="w-full mt-4 py-2 text-white/60 hover:text-white text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal Modal */}
      <RevealModal
        isOpen={showModal}
        name={revealedName}
        ticketNumber={revealedTicket}
        onClose={closeModal}
      />

      {/* Naughty Warning Modal */}
      <NaughtyWarning
        isOpen={showNaughtyWarning}
        onClose={() => setShowNaughtyWarning(false)}
        previousName={myPick?.recipientName || ''}
        previousTicket={myPick?.ticketNumber || 0}
      />
    </main>
  );
}
