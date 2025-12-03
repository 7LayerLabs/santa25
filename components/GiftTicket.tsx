'use client';

import { motion } from 'framer-motion';

interface GiftTicketProps {
  number: number;
  isTaken: boolean;
  isSelected: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export default function GiftTicket({ number, isTaken, isSelected, isLoading, onClick }: GiftTicketProps) {
  if (isTaken) {
    return (
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 0.95, 1] }}
        className="relative"
      >
        {/* Taken gift - opened/unwrapped look */}
        <div className="w-16 h-16 md:w-18 md:h-18 relative">
          {/* Torn wrapping paper */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg opacity-60 shadow-inner">
            {/* Torn edges effect */}
            <div className="absolute top-0 left-1/4 w-1/2 h-2 bg-gray-500 rounded-b-full" />
            <div className="absolute bottom-0 right-1/4 w-1/3 h-2 bg-gray-500 rounded-t-full" />
          </div>

          {/* Empty box underneath */}
          <div className="absolute inset-2 bg-gradient-to-br from-gray-300 to-gray-400 rounded border-2 border-dashed border-gray-500 flex items-center justify-center">
            <span className="text-gray-600 font-bold text-lg opacity-50">{number}</span>
          </div>

          {/* "Claimed" ribbon */}
          <div className="absolute -top-1 -right-1 bg-red-700 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-md transform rotate-12">
            CLAIMED
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: [-2, 2, -2, 0], y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isLoading}
      className={`relative group ${isLoading ? 'cursor-wait' : 'cursor-pointer'}`}
    >
      {/* Gift box */}
      <div className={`
        w-16 h-16 md:w-18 md:h-18 relative
        transition-all duration-300
        ${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-75 rounded-lg' : ''}
      `}>
        {/* Box shadow */}
        <div className="absolute -bottom-1 left-1 right-1 h-2 bg-black/20 rounded-full blur-sm" />

        {/* Main gift box */}
        <div className={`
          absolute inset-0 rounded-lg shadow-lg overflow-hidden
          ${number % 4 === 1 ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700' : ''}
          ${number % 4 === 2 ? 'bg-gradient-to-br from-green-500 via-green-600 to-green-700' : ''}
          ${number % 4 === 3 ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700' : ''}
          ${number % 4 === 0 ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700' : ''}
          border-2
          ${number % 4 === 1 ? 'border-red-800' : ''}
          ${number % 4 === 2 ? 'border-green-800' : ''}
          ${number % 4 === 3 ? 'border-blue-800' : ''}
          ${number % 4 === 0 ? 'border-purple-800' : ''}
        `}>
          {/* Ribbon horizontal */}
          <div className={`
            absolute top-1/2 -translate-y-1/2 w-full h-3
            ${number % 3 === 0 ? 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300' : ''}
            ${number % 3 === 1 ? 'bg-gradient-to-r from-white via-gray-100 to-white' : ''}
            ${number % 3 === 2 ? 'bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300' : ''}
          `} />

          {/* Ribbon vertical */}
          <div className={`
            absolute left-1/2 -translate-x-1/2 h-full w-3
            ${number % 3 === 0 ? 'bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-300' : ''}
            ${number % 3 === 1 ? 'bg-gradient-to-b from-white via-gray-100 to-white' : ''}
            ${number % 3 === 2 ? 'bg-gradient-to-b from-pink-300 via-pink-400 to-pink-300' : ''}
          `} />

          {/* Bow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={`
              w-6 h-6 rounded-full
              ${number % 3 === 0 ? 'bg-yellow-400 border-2 border-yellow-600' : ''}
              ${number % 3 === 1 ? 'bg-white border-2 border-gray-300' : ''}
              ${number % 3 === 2 ? 'bg-pink-400 border-2 border-pink-600' : ''}
              shadow-md flex items-center justify-center
            `}>
              <span className="text-xs font-bold text-gray-800">{number}</span>
            </div>
          </div>

          {/* Shine effect */}
          <div className="absolute top-1 left-1 w-4 h-4 bg-white/30 rounded-full blur-sm" />
        </div>

        {/* Lid (slightly lifted on hover) */}
        <motion.div
          className={`
            absolute -top-1 left-0 right-0 h-4 rounded-t-lg
            ${number % 4 === 1 ? 'bg-gradient-to-b from-red-400 to-red-600 border-red-700' : ''}
            ${number % 4 === 2 ? 'bg-gradient-to-b from-green-400 to-green-600 border-green-700' : ''}
            ${number % 4 === 3 ? 'bg-gradient-to-b from-blue-400 to-blue-600 border-blue-700' : ''}
            ${number % 4 === 0 ? 'bg-gradient-to-b from-purple-400 to-purple-600 border-purple-700' : ''}
            border-2 border-b-0 shadow-md
            group-hover:-translate-y-1 group-hover:rotate-[-5deg] transition-transform
          `}
        >
          {/* Lid ribbon */}
          <div className={`
            absolute top-1/2 -translate-y-1/2 w-full h-2
            ${number % 3 === 0 ? 'bg-yellow-400' : ''}
            ${number % 3 === 1 ? 'bg-white' : ''}
            ${number % 3 === 2 ? 'bg-pink-400' : ''}
          `} />
        </motion.div>
      </div>

      {/* Hover glow */}
      <div className={`
        absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
        ${number % 4 === 1 ? 'bg-red-400/30' : ''}
        ${number % 4 === 2 ? 'bg-green-400/30' : ''}
        ${number % 4 === 3 ? 'bg-blue-400/30' : ''}
        ${number % 4 === 0 ? 'bg-purple-400/30' : ''}
        blur-xl -z-10
      `} />
    </motion.button>
  );
}
