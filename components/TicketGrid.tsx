'use client';

import { motion } from 'framer-motion';

interface Ticket {
  number: number;
  isTaken: boolean;
  name?: string;
}

interface TicketGridProps {
  tickets: Ticket[];
  onTicketSelect: (ticketNumber: number) => void;
  selectedTicket: number | null;
  isLoading: boolean;
}

export default function TicketGrid({ tickets, onTicketSelect, selectedTicket, isLoading }: TicketGridProps) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-5 gap-3 md:gap-4 max-w-lg mx-auto">
      {tickets.map((ticket) => (
        <motion.button
          key={ticket.number}
          whileHover={!ticket.isTaken ? { scale: 1.1, rotate: 5 } : {}}
          whileTap={!ticket.isTaken ? { scale: 0.95 } : {}}
          onClick={() => !ticket.isTaken && !isLoading && onTicketSelect(ticket.number)}
          disabled={ticket.isTaken || isLoading}
          className={`
            relative w-14 h-14 md:w-16 md:h-16 rounded-lg font-christmas text-xl md:text-2xl
            transition-all duration-300 shadow-lg
            ${ticket.isTaken
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-2 border-gray-700'
              : 'bg-gradient-to-br from-green-500 to-green-700 text-white hover:from-green-400 hover:to-green-600 border-2 border-green-400 cursor-pointer'
            }
            ${selectedTicket === ticket.number ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}
          `}
        >
          {/* Ticket Number */}
          <span className="relative z-10">{ticket.number}</span>

          {/* Taken Overlay */}
          {ticket.isTaken && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-red-900/60 rounded-lg flex items-center justify-center"
              >
                <span className="text-xs text-red-300 font-bold">TAKEN</span>
              </motion.div>
            </div>
          )}

          {/* Shimmer for available tickets */}
          {!ticket.isTaken && (
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
