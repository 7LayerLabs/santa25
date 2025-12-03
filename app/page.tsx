'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SnowEffect from '@/components/SnowEffect';
import SantaSack from '@/components/SantaSack';
import GiftTicket from '@/components/GiftTicket';
import RevealModal from '@/components/RevealModal';
import NaughtyWarning from '@/components/NaughtyWarning';

// Your family names!
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

const STORAGE_KEY = 'secret-santa-pick';
const PICKER_NAME_KEY = 'secret-santa-picker-name';

interface Ticket {
  number: number;
  isTaken: boolean;
}

interface UserPick {
  pickerName: string;
  recipientName: string;
  ticketNumber: number;
  timestamp: number;
}

export default function Home() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [availableNames, setAvailableNames] = useState<string[]>([...FAMILY_NAMES]);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [revealedName, setRevealedName] = useState('');
  const [revealedTicket, setRevealedTicket] = useState(0);
  const [error, setError] = useState('');

  // Naughty list tracking
  const [userPick, setUserPick] = useState<UserPick | null>(null);
  const [showNaughtyWarning, setShowNaughtyWarning] = useState(false);

  // Name selection
  const [showNamePicker, setShowNamePicker] = useState(false);
  const [pickerName, setPickerName] = useState<string | null>(null);

  // Check localStorage for existing pick on mount
  useEffect(() => {
    const savedPick = localStorage.getItem(STORAGE_KEY);
    const savedPickerName = localStorage.getItem(PICKER_NAME_KEY);

    if (savedPick) {
      try {
        const parsed = JSON.parse(savedPick) as UserPick;
        setUserPick(parsed);
        setPickerName(parsed.pickerName);
      } catch (e) {
        console.error('Failed to parse saved pick:', e);
      }
    } else if (savedPickerName) {
      setPickerName(savedPickerName);
    }
  }, []);

  useEffect(() => {
    const initialTickets: Ticket[] = [];
    for (let i = 1; i <= FAMILY_NAMES.length; i++) {
      initialTickets.push({ number: i, isTaken: false });
    }
    setTickets(initialTickets);
  }, []);

  const selectPickerName = (name: string) => {
    setPickerName(name);
    localStorage.setItem(PICKER_NAME_KEY, name);
    setShowNamePicker(false);
  };

  const handleTicketSelect = useCallback(async (ticketNumber: number) => {
    if (isLoading) return;

    // Check if user already picked!
    if (userPick) {
      setShowNaughtyWarning(true);
      return;
    }

    // Check if user has identified themselves
    if (!pickerName) {
      setShowNamePicker(true);
      return;
    }

    const ticket = tickets.find(t => t.number === ticketNumber);
    if (ticket?.isTaken) {
      setError('This gift has already been claimed!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Get available names excluding the person they can't pick
    const excludedPerson = EXCLUSIONS[pickerName];
    const validNames = availableNames.filter(name =>
      name !== pickerName && name !== excludedPerson
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

    // Pick a random name from VALID names (excluding spouse/partner)
    const randomIndex = Math.floor(Math.random() * validNames.length);
    const pickedName = validNames[randomIndex];

    // Save to localStorage
    const newPick: UserPick = {
      pickerName: pickerName,
      recipientName: pickedName,
      ticketNumber: ticketNumber,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPick));
    setUserPick(newPick);

    setAvailableNames(prev => prev.filter(name => name !== pickedName));
    setTickets(prev => prev.map(ticket =>
      ticket.number === ticketNumber
        ? { ...ticket, isTaken: true }
        : ticket
    ));

    setRevealedName(pickedName);
    setRevealedTicket(ticketNumber);
    setShowModal(true);
    setIsShaking(false);
    setIsLoading(false);
    setSelectedTicket(null);
  }, [isLoading, tickets, availableNames, userPick, pickerName]);

  const closeModal = () => {
    setShowModal(false);
    setRevealedName('');
  };

  const takenCount = tickets.filter(t => t.isTaken).length;
  const availableCount = tickets.filter(t => !t.isTaken).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d0f0f] to-[#0f1a0f] relative overflow-hidden">
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
        className="relative z-10 text-center pt-6 pb-2 px-4"
      >
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-4xl">🎄</span>
          <h1 className="font-christmas text-5xl md:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-lg">
            Secret Santa
          </h1>
          <span className="text-4xl">🎄</span>
        </div>
        <p className="text-green-400/80 text-lg md:text-xl font-christmas">
          Reach into Santa's sack and pick your gift!
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center px-4 pb-8">
        {/* Show who is picking */}
        {pickerName && !userPick && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/80 border border-blue-500 rounded-xl px-6 py-2 mb-4 text-center"
          >
            <p className="text-blue-300 text-sm">Picking as:</p>
            <p className="text-white font-christmas text-xl">{pickerName}</p>
            <button
              onClick={() => {
                localStorage.removeItem(PICKER_NAME_KEY);
                setPickerName(null);
              }}
              className="text-blue-400 text-xs hover:text-blue-300 underline mt-1"
            >
              Not you? Change name
            </button>
          </motion.div>
        )}

        {/* Show previous pick reminder if they already picked */}
        {userPick && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/80 border border-green-500 rounded-xl px-6 py-3 mb-4 text-center"
          >
            <p className="text-green-300 text-sm">{userPick.pickerName}, you already picked! Your person is:</p>
            <p className="text-white font-christmas text-2xl">{userPick.recipientName}</p>
            <p className="text-green-400/60 text-xs">(Gift #{userPick.ticketNumber})</p>
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
          className="text-white/70 font-christmas text-lg mb-4 text-center"
        >
          {isLoading ? (
            <span className="text-yellow-400 animate-pulse">🎁 Reaching into the sack... 🎁</span>
          ) : userPick ? (
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
                {FAMILY_NAMES.map((name) => (
                  <button
                    key={name}
                    onClick={() => selectPickerName(name)}
                    className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-christmas text-lg transition-all border border-white/20 hover:border-yellow-400"
                  >
                    {name}
                  </button>
                ))}
              </div>

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
        previousName={userPick?.recipientName || ''}
        previousTicket={userPick?.ticketNumber || 0}
      />
    </main>
  );
}
