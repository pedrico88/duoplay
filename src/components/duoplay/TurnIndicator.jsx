import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function TurnIndicator({ room }) {
  const [myEmail, setMyEmail] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setMyEmail(u?.email));
  }, []);

  if (!myEmail || !room.current_turn) return null;

  const isMyTurn = room.current_turn === myEmail;
  const turnName = room.current_turn === room.host_email
    ? room.host_nickname
    : room.guest_nickname;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={room.current_turn}
        initial={{ opacity: 0, scale: 0.9, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 8 }}
        className={`px-5 py-3 rounded-2xl flex items-center gap-2 font-medium text-sm ${
          isMyTurn
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {isMyTurn ? (
          <>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              🎯
            </motion.span>
            ¡Es tu turno!
          </>
        ) : (
          <>
            <motion.span
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ⏳
            </motion.span>
            Turno de {turnName}…
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}