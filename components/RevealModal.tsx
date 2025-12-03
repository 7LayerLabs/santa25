'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RevealModalProps {
  isOpen: boolean;
  name: string;
  ticketNumber: number;
  onClose: () => void;
}

export default function RevealModal({ isOpen, name, ticketNumber, onClose }: RevealModalProps) {
  const [stage, setStage] = useState(0); // 0: gift, 1: opening, 2: reveal

  useEffect(() => {
    if (isOpen) {
      setStage(0);
      const timer1 = setTimeout(() => setStage(1), 800);
      const timer2 = setTimeout(() => setStage(2), 1800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={stage === 2 ? onClose : undefined}
        >
          {/* Spotlight effect */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Stage 0 & 1: Gift Box */}
            {stage < 2 && (
              <motion.div
                animate={stage === 1 ? { y: [0, -20, 0], rotate: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                {/* Large gift box */}
                <div className="w-64 h-64 relative">
                  {/* Box body */}
                  <div className="absolute bottom-0 w-full h-48 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-lg border-4 border-red-800 shadow-2xl">
                    {/* Ribbon vertical */}
                    <div className="absolute left-1/2 -translate-x-1/2 h-full w-8 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300" />
                    {/* Ribbon horizontal */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-8 bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-300" />
                    {/* Center bow knot */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-400 rounded-full border-4 border-yellow-600 shadow-lg" />
                  </div>

                  {/* Lid */}
                  <motion.div
                    animate={stage === 1 ? {
                      y: [-10, -60, -80],
                      rotate: [0, -20, -45],
                      x: [0, -20, -40]
                    } : {}}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute top-8 w-full h-12 bg-gradient-to-b from-red-400 to-red-600 rounded-t-lg border-4 border-b-0 border-red-700 shadow-xl"
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-6 bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-300" />
                  </motion.div>

                  {/* Bow on top */}
                  <motion.div
                    animate={stage === 1 ? {
                      y: [-10, -60, -80],
                      rotate: [0, -20, -45],
                      x: [0, -20, -40]
                    } : {}}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                  >
                    {/* Bow loops */}
                    <div className="relative">
                      <div className="absolute -left-8 top-2 w-10 h-6 bg-yellow-400 rounded-full border-2 border-yellow-600 transform -rotate-30" />
                      <div className="absolute -right-8 top-2 w-10 h-6 bg-yellow-400 rounded-full border-2 border-yellow-600 transform rotate-30" />
                      <div className="w-8 h-8 bg-yellow-500 rounded-full border-4 border-yellow-600 shadow-lg relative z-10" />
                      {/* Ribbon tails */}
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1">
                        <div className="w-3 h-12 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-b-full transform -rotate-12" />
                        <div className="w-3 h-12 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-b-full transform rotate-12" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Question marks floating */}
                <motion.span
                  animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-8 -left-4 text-4xl"
                >
                  ❓
                </motion.span>
                <motion.span
                  animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="absolute -top-6 -right-4 text-3xl"
                >
                  ❓
                </motion.span>

                <p className="text-center text-white font-bold text-2xl mt-6">
                  {stage === 0 ? 'Opening gift...' : 'Unwrapping...'}
                </p>
              </motion.div>
            )}

            {/* Stage 2: Name Reveal */}
            {stage === 2 && (
              <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-center"
              >
                {/* Decorative frame */}
                <div className="relative bg-gradient-to-b from-green-800 via-green-900 to-green-950 rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-yellow-500 min-w-[300px]">
                  {/* Corner decorations */}
                  <div className="absolute top-3 left-3 text-2xl">🎄</div>
                  <div className="absolute top-3 right-3 text-2xl">🎄</div>
                  <div className="absolute bottom-3 left-3 text-2xl">🎁</div>
                  <div className="absolute bottom-3 right-3 text-2xl">🎁</div>

                  {/* Holly decoration top */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    <span className="text-3xl">🍃</span>
                    <span className="text-2xl">🔴</span>
                    <span className="text-2xl">🔴</span>
                    <span className="text-3xl transform scale-x-[-1]">🍃</span>
                  </div>

                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-yellow-400 text-lg font-bold">Gift #{ticketNumber}</p>
                      <h2 className="font-bold text-3xl text-white">You're buying for...</h2>
                    </motion.div>

                    {/* Name card */}
                    <motion.div
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="bg-gradient-to-br from-white to-gray-100 rounded-xl p-6 shadow-xl border-2 border-gray-300 my-6"
                    >
                      <div className="w-4 h-4 bg-red-500 rounded-full mx-auto -mt-8 mb-2 shadow-md border-2 border-red-700" />
                      <h3 className="font-bold text-5xl md:text-6xl text-green-800 drop-shadow-sm">
                        {name}
                      </h3>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-green-300 font-bold text-xl"
                    >
                      Keep it secret! 🤫
                    </motion.p>
                  </div>
                </div>

                {/* Confetti */}
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: 0,
                        y: 0,
                        scale: 0,
                        rotate: 0
                      }}
                      animate={{
                        x: (Math.random() - 0.5) * 400,
                        y: (Math.random() - 0.5) * 400,
                        scale: [0, 1, 1, 0],
                        rotate: Math.random() * 720
                      }}
                      transition={{
                        duration: 2,
                        delay: 0.3 + i * 0.03,
                        ease: 'easeOut'
                      }}
                      className={`absolute top-1/2 left-1/2 w-3 h-3 ${
                        ['bg-red-500', 'bg-yellow-400', 'bg-green-500', 'bg-blue-500', 'bg-pink-500', 'bg-white'][i % 6]
                      } ${i % 3 === 0 ? 'rounded-full' : i % 3 === 1 ? 'rounded-sm' : ''}`}
                      style={{
                        width: i % 2 === 0 ? '12px' : '8px',
                        height: i % 2 === 0 ? '12px' : '8px',
                      }}
                    />
                  ))}
                </div>

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  onClick={onClose}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xl rounded-full border-2 border-red-400 shadow-lg transition-all"
                >
                  Merry Christmas! 🎅
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
