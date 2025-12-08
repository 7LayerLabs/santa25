'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import SnowEffect from '@/components/SnowEffect';
import SantaSack from '@/components/SantaSack';
import GiftTicket from '@/components/GiftTicket';
import RevealModal from '@/components/RevealModal';
import NaughtyWarning from '@/components/NaughtyWarning';
import { db, generateAssignments } from '@/lib/instantdb';
import { tx, id } from '@instantdb/react';

export default function GamePage() {
  const params = useParams();
  const gameId = params.gameId as string;

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

  // Local storage keys specific to this game
  const LOCAL_PICK_KEY = `secret-santa-${gameId}-pick`;
  const LOCAL_PICKER_KEY = `secret-santa-${gameId}-picker`;

  // Query InstantDB for game and picks data
  const { isLoading: dbLoading, error: dbError, data } = db.useQuery({
    games: { $: { where: { gameCode: gameId } } },
    picks: { $: { where: { gameId: gameId } } }
  });

  const game = data?.games?.[0];
  const picks = data?.picks || [];
  const names: string[] = game?.names || [];
  const exclusions: { [key: string]: string[] } = game?.exclusions || {};
  const assignments: { [picker: string]: string } = game?.assignments || {};

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
  }, [LOCAL_PICK_KEY, LOCAL_PICKER_KEY]);

  // Show name picker after database loads if no name selected
  useEffect(() => {
    if (!dbLoading && game && !pickerName && !myPick) {
      setShowNamePicker(true);
    }
  }, [dbLoading, game, pickerName, myPick]);

  // Check if local pick still exists in database - if not, clear local storage (game was reset)
  useEffect(() => {
    if (!dbLoading && myPick && game) {
      const stillExists = picks.some((p: any) =>
        p.pickerName === myPick.pickerName && p.recipientName === myPick.recipientName
      );

      if (!stillExists) {
        localStorage.removeItem(LOCAL_PICK_KEY);
        localStorage.removeItem(LOCAL_PICKER_KEY);
        setMyPick(null);
        setPickerName(null);
        setShowNamePicker(true);
      }
    }
  }, [dbLoading, picks, myPick, game, LOCAL_PICK_KEY, LOCAL_PICKER_KEY]);

  // Calculate taken tickets and available names from real-time data
  const takenTickets = new Set(picks.map((p: any) => p.ticketNumber));
  const takenNames = new Set(picks.map((p: any) => p.recipientName));
  const availableNames = names.filter(name => !takenNames.has(name));

  // Build ticket array
  const tickets = names.map((_, i) => ({
    number: i + 1,
    isTaken: takenTickets.has(i + 1)
  }));

  const selectPickerName = (name: string) => {
    setPickerName(name);
    localStorage.setItem(LOCAL_PICKER_KEY, name);
    setShowNamePicker(false);
  };

  const handleTicketSelect = useCallback(async (ticketNumber: number) => {
    if (isLoading || dbLoading || !game) return;

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

    setSelectedTicket(ticketNumber);
    setIsShaking(true);
    setIsLoading(true);
    setError('');

    // Dramatic pause while "reaching into the sack"
    await new Promise(resolve => setTimeout(resolve, 2000));

    let pickedName: string;
    let currentAssignments = assignments;

    // If no assignments exist yet, generate them now (first picker)
    if (Object.keys(currentAssignments).length === 0) {
      const newAssignments = generateAssignments(names, exclusions);

      if (!newAssignments) {
        setError('Cannot create valid assignments with these exclusion rules. Please adjust exclusions.');
        setIsShaking(false);
        setIsLoading(false);
        setSelectedTicket(null);
        setTimeout(() => setError(''), 5000);
        return;
      }

      // Save assignments to database
      try {
        await db.transact(
          tx.games[game.id].update({
            assignments: newAssignments
          })
        );
        currentAssignments = newAssignments;
      } catch (err) {
        console.error('Failed to save assignments:', err);
        setError('Failed to generate assignments. Please try again!');
        setIsShaking(false);
        setIsLoading(false);
        setSelectedTicket(null);
        return;
      }
    }

    // Get this person's pre-assigned recipient
    pickedName = currentAssignments[pickerName];

    if (!pickedName) {
      setError('Something went wrong. Please refresh and try again.');
      setIsShaking(false);
      setIsLoading(false);
      setSelectedTicket(null);
      return;
    }

    // Save to InstantDB
    try {
      await db.transact(
        tx.picks[id()].update({
          gameId: gameId,
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
  }, [isLoading, dbLoading, game, myPick, pickerName, takenTickets, picks, names, exclusions, assignments, gameId, LOCAL_PICK_KEY]);

  const closeModal = () => {
    setShowModal(false);
    setRevealedName('');
  };

  const takenCount = tickets.filter(t => t.isTaken).length;
  const availableCount = tickets.filter(t => !t.isTaken).length;

  // Loading state
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

  // Game not found
  if (!game) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d0f0f] to-[#0f1a0f] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🎅</span>
          <h1 className="text-white font-christmas text-3xl mb-2">Game Not Found</h1>
          <p className="text-gray-400 mb-4">This Secret Santa game doesn't exist or has been deleted.</p>
          <a href="/" className="text-green-400 hover:text-green-300 underline">
            Create a new game
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a0a0a] via-[#2d0f0f] to-[#0f1a0f] relative">
      {/* Ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-900/20 rounded-full blur-3xl" />

      <SnowEffect />

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
        <p className="text-green-400/80 text-2xl md:text-3xl font-bold">
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
          className="text-white/70 font-bold text-xl md:text-2xl mb-4 text-center"
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
          className={`grid gap-3 md:gap-4 max-w-lg mx-auto mb-6 ${
            names.length <= 6 ? 'grid-cols-3' :
            names.length <= 9 ? 'grid-cols-3' :
            names.length <= 12 ? 'grid-cols-4' :
            'grid-cols-5'
          }`}
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

        {/* Admin link */}
        <a
          href={`/game/${gameId}/admin`}
          className="text-gray-500 hover:text-gray-400 text-sm underline"
        >
          Admin Panel
        </a>

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
              className="bg-gradient-to-b from-green-800 to-green-900 rounded-2xl p-6 max-w-md w-full border-4 border-yellow-500 shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <span className="text-5xl">🎅</span>
                <h2 className="font-christmas text-3xl text-white mt-2">Who's Picking?</h2>
                <p className="text-green-300 text-sm mt-1">Select your name to continue</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {names.map((name) => {
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
