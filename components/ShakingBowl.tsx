'use client';

import { motion } from 'framer-motion';

interface ShakingBowlProps {
  isShaking: boolean;
  onClick: () => void;
  disabled: boolean;
}

export default function ShakingBowl({ isShaking, onClick, disabled }: ShakingBowlProps) {
  return (
    <motion.div
      animate={isShaking ? { rotate: [0, -5, 5, -5, 5, 0] } : { rotate: 0 }}
      transition={{
        duration: 0.5,
        repeat: isShaking ? Infinity : 0,
        repeatDelay: 0.5,
      }}
      className="relative cursor-pointer"
      onClick={disabled ? undefined : onClick}
    >
      {/* Santa Sack */}
      <div className="relative w-64 h-72 md:w-80 md:h-96">
        {/* Sack Body */}
        <div className="absolute bottom-0 w-full h-4/5 bg-gradient-to-b from-red-700 to-red-900 rounded-b-full rounded-t-3xl shadow-2xl border-4 border-red-950">
          {/* Sack Texture Lines */}
          <div className="absolute inset-4 opacity-20">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent"></div>
          </div>
          {/* Shimmer Effect */}
          <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-white/20 rounded-full blur-xl"></div>
        </div>

        {/* Sack Opening/Tie */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3/4">
          {/* Gathered Top */}
          <div className="w-full h-12 bg-gradient-to-b from-red-600 to-red-700 rounded-t-full border-4 border-red-950 border-b-0"></div>
          {/* Golden Tie */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 rounded-full shadow-lg border-2 border-yellow-600"></div>
          {/* Ribbon Tails */}
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 flex gap-2">
            <motion.div
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-4 h-16 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full transform -rotate-12"
            ></motion.div>
            <motion.div
              animate={{ rotate: [5, -5, 5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-4 h-16 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full transform rotate-12"
            ></motion.div>
          </div>
        </div>

        {/* Name Tags Peeking Out */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-16 left-8 w-8 h-12 bg-white rounded shadow-md transform -rotate-12 border border-gray-300"
        >
          <div className="w-full h-1 bg-gray-400 mt-2"></div>
          <div className="w-3/4 h-1 bg-gray-300 mt-1 ml-1"></div>
        </motion.div>
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
          className="absolute top-14 right-10 w-6 h-10 bg-green-100 rounded shadow-md transform rotate-6 border border-gray-300"
        >
          <div className="w-full h-1 bg-gray-400 mt-2"></div>
        </motion.div>
      </div>

      {/* Call to Action Text */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
      >
        <span className="text-white font-christmas text-2xl md:text-3xl drop-shadow-lg bg-green-700/80 px-6 py-2 rounded-full border-2 border-green-500">
          {disabled ? 'Select a Ticket!' : 'Pick a Name!'}
        </span>
      </motion.div>
    </motion.div>
  );
}
