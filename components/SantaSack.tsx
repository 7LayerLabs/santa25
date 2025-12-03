'use client';

import { motion } from 'framer-motion';

interface SantaSackProps {
  isShaking: boolean;
  isDrawing: boolean;
  availableCount: number;
}

export default function SantaSack({ isShaking, isDrawing, availableCount }: SantaSackProps) {
  return (
    <div className="relative">
      {/* Glow effect behind sack */}
      <div className="absolute inset-0 blur-3xl bg-yellow-500/20 rounded-full scale-150" />

      <motion.div
        animate={isShaking ? {
          rotate: [0, -3, 3, -3, 3, -2, 2, 0],
          y: [0, -5, 0, -3, 0]
        } : { rotate: 0 }}
        transition={{
          duration: 0.6,
          repeat: isShaking ? Infinity : 0,
          repeatDelay: 0.8,
        }}
        className="relative"
      >
        {/* Main Sack SVG */}
        <svg
          viewBox="0 0 300 350"
          className="w-72 h-80 md:w-80 md:h-96 drop-shadow-2xl"
        >
          {/* Sack shadow */}
          <ellipse cx="150" cy="330" rx="100" ry="15" fill="rgba(0,0,0,0.3)" />

          {/* Main sack body */}
          <defs>
            <linearGradient id="sackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="30%" stopColor="#A0522D" />
              <stop offset="50%" stopColor="#CD853F" />
              <stop offset="70%" stopColor="#A0522D" />
              <stop offset="100%" stopColor="#6B3E0A" />
            </linearGradient>
            <linearGradient id="sackHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="roughTexture">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDiffuseLighting in="noise" lightingColor="#D2691E" surfaceScale="2" result="light">
                <feDistantLight azimuth="45" elevation="60" />
              </feDiffuseLighting>
              <feComposite in="SourceGraphic" in2="light" operator="multiply" />
            </filter>
          </defs>

          {/* Sack body shape */}
          <path
            d="M50 320
               Q30 280 40 200
               Q45 120 80 80
               Q100 60 150 55
               Q200 60 220 80
               Q255 120 260 200
               Q270 280 250 320
               Q200 340 150 340
               Q100 340 50 320Z"
            fill="url(#sackGradient)"
            stroke="#5D3A1A"
            strokeWidth="3"
          />

          {/* Texture overlay */}
          <path
            d="M50 320
               Q30 280 40 200
               Q45 120 80 80
               Q100 60 150 55
               Q200 60 220 80
               Q255 120 260 200
               Q270 280 250 320
               Q200 340 150 340
               Q100 340 50 320Z"
            fill="url(#sackHighlight)"
            opacity="0.5"
          />

          {/* Fabric folds/wrinkles */}
          <path d="M80 150 Q100 180 80 220" stroke="#6B3E0A" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M220 160 Q200 190 220 230" stroke="#6B3E0A" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M120 250 Q150 270 180 250" stroke="#6B3E0A" strokeWidth="2" fill="none" opacity="0.3" />

          {/* Sack opening/gathered top */}
          <ellipse cx="150" cy="60" rx="70" ry="20" fill="#8B4513" stroke="#5D3A1A" strokeWidth="2" />
          <ellipse cx="150" cy="55" rx="60" ry="15" fill="#2D1810" />

          {/* Rope tie */}
          <path
            d="M80 50 Q90 35 110 40 Q130 45 150 40 Q170 35 190 40 Q210 45 220 50"
            fill="none"
            stroke="#DEB887"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M80 50 Q90 35 110 40 Q130 45 150 40 Q170 35 190 40 Q210 45 220 50"
            fill="none"
            stroke="#F5DEB3"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Rope bow */}
          <ellipse cx="150" cy="35" rx="15" ry="10" fill="#DEB887" stroke="#C4A574" strokeWidth="2" />

          {/* Rope tails */}
          <motion.path
            animate={{ d: isShaking ? [
              "M135 40 Q120 60 115 85 Q110 100 120 110",
              "M135 40 Q115 55 110 80 Q105 95 115 105",
              "M135 40 Q120 60 115 85 Q110 100 120 110"
            ] : "M135 40 Q120 60 115 85 Q110 100 120 110" }}
            transition={{ duration: 0.6, repeat: isShaking ? Infinity : 0 }}
            fill="none"
            stroke="#DEB887"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <motion.path
            animate={{ d: isShaking ? [
              "M165 40 Q180 60 185 85 Q190 100 180 110",
              "M165 40 Q185 55 190 80 Q195 95 185 105",
              "M165 40 Q180 60 185 85 Q190 100 180 110"
            ] : "M165 40 Q180 60 185 85 Q190 100 180 110" }}
            transition={{ duration: 0.6, repeat: isShaking ? Infinity : 0 }}
            fill="none"
            stroke="#DEB887"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        {/* Gifts peeking out */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-1">
          <motion.div
            animate={{ y: [0, -5, 0], rotate: [-5, -8, -5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            className="w-8 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-sm shadow-lg border border-red-800"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-1 bg-yellow-400" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-full bg-yellow-400" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -3, 0], rotate: [5, 8, 5] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
            className="w-6 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-sm shadow-lg border border-green-800"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-1 bg-white" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -4, 0], rotate: [3, 0, 3] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
            className="w-7 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-sm shadow-lg border border-blue-800"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-1 bg-silver" style={{ backgroundColor: '#C0C0C0' }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-full bg-silver" style={{ backgroundColor: '#C0C0C0' }} />
            </div>
          </motion.div>
        </div>

        {/* Name tags floating */}
        {availableCount > 0 && (
          <>
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [-10, -15, -10],
                x: [0, 3, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-16 left-16 w-10 h-6 bg-gradient-to-b from-white to-gray-100 rounded shadow-md border border-gray-300 flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 absolute -top-1 left-1/2 -translate-x-1/2" />
              <div className="text-[6px] text-gray-600 font-bold">NAME</div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, -6, 0],
                rotate: [8, 12, 8],
                x: [0, -2, 0]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              className="absolute top-20 right-16 w-8 h-5 bg-gradient-to-b from-green-100 to-green-200 rounded shadow-md border border-green-300 flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-600 absolute -top-1 left-1/2 -translate-x-1/2" />
              <div className="text-[5px] text-green-800 font-bold">???</div>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Drawing animation - hand reaching in */}
      {isDrawing && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-0 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-6xl"
          >
            🤚
          </motion.div>
        </motion.div>
      )}

      {/* Sparkles around sack */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-4 -left-4 text-2xl"
      >
        ✨
      </motion.div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        className="absolute -top-2 -right-4 text-xl"
      >
        ✨
      </motion.div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="absolute bottom-20 -right-6 text-lg"
      >
        ⭐
      </motion.div>
    </div>
  );
}
