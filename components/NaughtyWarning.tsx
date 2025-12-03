'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface NaughtyWarningProps {
  isOpen: boolean;
  onClose: () => void;
  previousName: string;
  previousTicket: number;
}

const NAUGHTY_MESSAGES = [
  "Nice try, sneaky elf!",
  "Santa sees EVERYTHING!",
  "Ho ho NO! One gift per person!",
  "The elves are watching...",
  "Coal futures are looking UP for you!",
];

export default function NaughtyWarning({ isOpen, onClose, previousName, previousTicket }: NaughtyWarningProps) {
  const randomMessage = NAUGHTY_MESSAGES[Math.floor(Math.random() * NAUGHTY_MESSAGES.length)];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{
              scale: 1,
              rotate: [0, -5, 5, -5, 5, 0],
            }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{
              scale: { type: 'spring', duration: 0.5 },
              rotate: { duration: 0.5, delay: 0.3 }
            }}
            className="relative max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Card */}
            <div className="bg-gradient-to-b from-red-800 via-red-900 to-red-950 rounded-3xl p-8 shadow-2xl border-4 border-red-500 relative overflow-hidden">
              {/* Striped warning pattern */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-full w-4 bg-yellow-400"
                    style={{ left: `${i * 40}px`, transform: 'skewX(-20deg)' }}
                  />
                ))}
              </div>

              {/* Naughty List Scroll */}
              <div className="relative">
                {/* Warning Icon */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, -10, 10, 0]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-center mb-4"
                >
                  <span className="text-7xl">🚨</span>
                </motion.div>

                <h2 className="font-bold text-3xl text-yellow-400 text-center mb-2">
                  NAUGHTY LIST ALERT!
                </h2>

                <motion.p
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-white text-center text-xl font-bold mb-4"
                >
                  {randomMessage}
                </motion.p>

                {/* Previous pick info */}
                <div className="bg-black/30 rounded-xl p-4 mb-4 border border-red-700">
                  <p className="text-red-300 text-center text-base font-medium mb-2">
                    You already picked from Gift #{previousTicket}
                  </p>
                  <p className="text-white text-center font-bold text-2xl">
                    Your person is: <span className="text-yellow-400">{previousName}</span>
                  </p>
                </div>

                {/* Warning message */}
                <div className="text-center space-y-2">
                  <p className="text-red-300 text-base font-medium">
                    Trying to pick again? That's a one-way ticket to the...
                  </p>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="text-3xl">📜</span>
                    <span className="font-bold text-2xl text-red-400">NAUGHTY LIST</span>
                    <span className="text-3xl">📜</span>
                  </motion.div>
                </div>

                {/* Coal emoji rain */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ y: -50, x: Math.random() * 300, opacity: 0 }}
                      animate={{
                        y: 400,
                        opacity: [0, 1, 1, 0],
                        rotate: 360
                      }}
                      transition={{
                        duration: 3,
                        delay: i * 0.3,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      className="absolute text-2xl"
                    >
                      🪨
                    </motion.span>
                  ))}
                </div>

                {/* Santa watching */}
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-4 -right-4 text-5xl"
                >
                  <motion.span
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🎅
                  </motion.span>
                </motion.div>

                {/* Elf watching */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="absolute -top-2 -left-4 text-4xl"
                >
                  <motion.span
                    animate={{ rotate: [5, -5, 5] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    🧝
                  </motion.span>
                </motion.div>
              </div>
            </div>

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={onClose}
              className="w-full mt-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-xl rounded-full border-2 border-green-400 shadow-lg transition-all"
            >
              I'll be good! 😇
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
